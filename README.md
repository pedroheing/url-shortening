# URL Shortening Service

![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=flat&logo=nestjs&logoColor=white)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=flat&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=flat&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=flat&logo=docker&logoColor=white)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white)](#)

A URL shortening service built with NestJS, featuring a cache-first redirect strategy with Redis, asynchronous click processing via a background worker, per-click metrics covering geographic and device data, and two-tier rate limiting backed by Redis.

## Table of Contents

- [Architecture and Features](#architecture-and-features)
    - [URL Shortening with Base62 Encoding](#url-shortening-with-base62-encoding)
    - [Cache-First Redirect Strategy](#cache-first-redirect-strategy)
    - [Asynchronous Click Processing](#asynchronous-click-processing)
    - [Rate Limiting](#rate-limiting)
- [Design Decisions and Trade-offs](#design-decisions-and-trade-offs)
    - [Database Sequences for Unique Short Codes](#database-sequences-for-unique-short-codes)
    - [Redis Queue for Click Ingestion](#redis-queue-for-click-ingestion)
    - [Cache-First vs. Database-First Redirect](#cache-first-vs-database-first-redirect)
    - [Two-Tier Rate Limiting](#two-tier-rate-limiting)
    - [Distributed Lock on Cache Miss](#distributed-lock-on-cache-miss)
    - [Negative Caching](#negative-caching)
- [Future Improvements](#future-improvements)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Configuration](#configuration)
    - [Execution](#execution)
- [Access Points](#access-points)
- [API Documentation](#api-documentation)
    - [Core Endpoints](#core-endpoints)
- [Run Tests](#run-tests)

## Architecture and Features

### URL Shortening with Base62 Encoding

Short codes are generated from a PostgreSQL sequence and Base62-encoded, producing a compact, URL-safe identifier with no collision checks needed.

<details>
  <summary>Click to view the URL Shortening Sequence Diagram</summary>

```mermaid
sequenceDiagram
  autonumber
  participant Client
  participant API
  participant DB as PostgreSQL
  participant Cache as Redis

  Client->>API: POST /api/v1/shorten { url }

  API->>DB: Fetch next value from sequence
  DB-->>API: Sequence number (e.g. 12345)

  API->>API: Base62 encode sequence number → short code

  API->>DB: INSERT short_url (url, short_code)
  DB-->>API: Saved record

  API->>Cache: Cache short_code → url (with TTL)

  API-->>Client: 201 Created { shortCode, shortUrl, url }
```

</details>

### Cache-First Redirect Strategy

Redirect lookups always check Redis first. On a cache miss, a distributed lock serializes database access. Only one instance queries PostgreSQL while others wait and read from cache once it's populated. Short codes not found in the database are also cached as negative entries, so repeated lookups for deleted or non-existent codes never hit PostgreSQL.

<details>
  <summary>Click to view the Redirect Flow Diagram</summary>

```mermaid
flowchart TD
  A[GET /:shortCode] --> B[Lookup in Redis Cache]

  B --> C{Cache Hit?}

  C -- Yes --> D2{Negative entry?}
  D2 -- Yes --> NOT_FOUND[404 Not Found]
  D2 -- No --> CLICK[Capture click metadata]

  C -- No --> D[Acquire distributed lock]

  D --> E[Lookup in Redis Cache again]
  E --> F{Cache Hit?}

  F -- Yes --> D3{Negative entry?}
  D3 -- Yes --> REL1B[Release lock]
  REL1B --> NOT_FOUND
  D3 -- No --> REL1[Release lock]
  REL1 --> CLICK

  F -- No --> G[Lookup in PostgreSQL]
  G --> H{Found in DB?}

  H -- No --> NEG[Cache negative entry in Redis]
  NEG --> REL2[Release lock]
  REL2 --> NOT_FOUND

  H -- Yes --> I[Hydrate Redis Cache]
  I --> REL3[Release lock]
  REL3 --> CLICK

  CLICK --> J[Enqueue click event to Redis]
  J --> K[302 Redirect to original URL]
```

</details>

### Asynchronous Click Processing

Every redirect enqueues a click event to Redis instead of writing directly to the database. A scheduled worker polls the queue every second, batches up to 100 events, and bulk-inserts them into PostgreSQL.

<details>
  <summary>Click to view the Click Processing Diagram</summary>

```mermaid
sequenceDiagram
  autonumber
  participant Client
  participant API
  participant Queue as Redis (Queue)
  participant Worker as Clicks Worker
  participant DB as PostgreSQL

  Client->>API: GET /:shortCode

  API->>Queue: RPUSH click event (IP, UA, geo, device...)
  API-->>Client: 302 Redirect

  Note over Worker: Runs every 1 second

  Worker->>Queue: LPOP up to 1000 events
  Queue-->>Worker: Batch of click events

  Worker->>DB: Bulk INSERT into clicks table
  DB-->>Worker: OK
```

</details>

### Rate Limiting

All endpoints are protected by two independent rate limiters applied on every request:

- **Per-IP:** limits how many requests a single IP address can make within a time window.
- **Global:** limits the total number of requests across all clients within a time window, regardless of IP.

Both counters are stored in Redis, so limits are shared across all application instances and survive process restarts. The real client IP is extracted from proxy headers (`X-Forwarded-For`, etc.) before being used as the key, ensuring accurate tracking behind load balancers.

## Design Decisions and Trade-offs

### Database Sequences for Unique Short Codes

**Decision:** Short codes are generated by Base62-encoding a PostgreSQL sequence value, rather than using random strings or hashes.

- **Rationale:** Sequences guarantee uniqueness at the database level with no need for collision detection or retry loops. Combined with Base62 encoding, the result is a compact, URL-safe string.
- **Trade-off:** Short codes are predictable. A sequential pattern is observable by anyone who creates multiple URLs. This is a reasonable trade-off for a URL shortener but would not be acceptable in contexts where opaque IDs are a security requirement.

### Redis Queue for Click Ingestion

**Decision:** Click events are pushed to a Redis list on every redirect and consumed asynchronously by a scheduled worker, rather than being written synchronously to PostgreSQL.

- **Rationale:** Database writes are expensive under high redirect throughput. Offloading them to an async worker keeps redirect latency low and allows bulk-insert optimizations.
- **Trade-off:** Clicks are not immediately visible in the analytics endpoints. There is a delay between a click being enqueued and it being persisted, which grows with queue depth. Queued events survive application restarts since they live in Redis, but are lost if Redis itself restarts without persistence enabled.

### Cache-First vs. Database-First Redirect

**Decision:** The redirect endpoint resolves short codes from Redis and only falls back to PostgreSQL on a cache miss.

- **Rationale:** For a URL shortener, read traffic vastly outnumbers write traffic. Serving the common case entirely from Redis reduces database load and keeps redirect latency consistently low.
- **Trade-off:** Redis is a hard dependency with no fallback. If it goes down, redirects fail completely.

### Two-Tier Rate Limiting

**Decision:** Rate limiting is enforced at two independent levels on every request: per-IP and globally across all clients.

- **Rationale:** A per-IP limit alone does not protect against distributed abuse where many IPs each stay just below the threshold. A global limit caps total throughput regardless of how the traffic is distributed. Both counters live in Redis so the limits hold across multiple application instances.
- **Trade-off:** Every request incurs two Redis increments. This adds a small amount of latency but is negligible compared to the cost of the redirect flow itself.

### Distributed Lock on Cache Miss

**Decision:** On a cache miss, a distributed lock is acquired before querying PostgreSQL. After acquiring the lock, the cache is checked again before going to the database.

- **Rationale:** Without a lock, a burst of requests for the same uncached short code would all hit the database at once. The double-checked pattern means only the first request queries the database; the rest wait on the lock and read from the cache once it's populated.
- **Trade-off:** Acquiring a lock adds latency to cache-miss requests. Since misses are rare once the cache is warm, this is an acceptable cost to avoid database overload during traffic spikes.

### Negative Caching

**Decision:** When a short code lookup misses the database, a negative cache entry is stored in Redis with the same TTL used for positive entries.

- **Rationale:** Without negative caching, every request for a deleted or non-existent short code would follow the full cache-miss path: acquire lock → query DB → get nothing → return 404. Under a burst of such requests (e.g., a deleted URL still being clicked), this would hammer the database with identical no-op queries. Caching the negative result short-circuits subsequent requests at the Redis layer.
- **Trade-off:** Non-existent or deleted short codes probed by bots or stale links will occupy cache space for the full TTL duration. This is bounded by the TTL and is negligible compared to the protection it provides.

## Future Improvements

- **Custom Short Codes:**
  Allow users to specify a custom alias instead of receiving an auto-generated short code.

## Tech Stack

- **Runtime:** Node.js (v22)
- **Framework:** NestJS
- **Database:** PostgreSQL 17
- **ORM:** Prisma
- **Cache / Queue:** Redis 8
- **Infrastructure:** Docker and Docker Compose

## Getting Started

### Prerequisites

- Docker Engine
- Docker Compose

### Installation

Clone the repository:

```bash
git clone https://github.com/pedroheing/url-shortening.git && cd url-shortening
```

### Configuration

The application is pre-configured for the Docker environment.

To change the configuration, edit the `docker-compose.yml` file.

Default variables:

| Variable                      | Description                               | Default                                                                   |
| ----------------------------- | ----------------------------------------- | ------------------------------------------------------------------------- |
| `PORT`                        | Port the API listens on                   | `3000`                                                                    |
| `DATABASE_URL`                | PostgreSQL connection string              | `postgresql://admin:password@localhost:5432/url-shortening?schema=public` |
| `REDIS_HOST`                  | Redis host                                | `redis`                                                                   |
| `REDIS_PORT`                  | Redis port                                | `6379`                                                                    |
| `SHORT_URL_BASE`              | Base URL prepended to short codes         | `http://localhost:3000`                                                   |
| `SHORT_URL_CACHE_TTL_SECONDS` | Redis TTL for cached short URLs (seconds) | `300`                                                                     |
| `THROTTLE_IP_TTL`             | Rate limit window per IP (milliseconds)   | `60000`                                                                   |
| `THROTTLE_IP_LIMIT`           | Max requests per IP per window            | `100`                                                                     |
| `THROTTLE_GLOBAL_TTL`         | Global rate limit window (milliseconds)   | `60000`                                                                   |
| `THROTTLE_GLOBAL_LIMIT`       | Max total requests per window             | `100000`                                                                  |

### Execution

The project is fully containerized. To start the application and all dependent services, run:

```bash
docker compose up -d --build
```

On startup, it will:

1. Build the API and migration containers.
2. Wait for PostgreSQL and Redis to be healthy.
3. Run database migrations.
4. Seed the database with initial data (10 short URLs with 100 clicks each).
5. Start the API server.

## Access Points

| Service           | URL                              | Credentials / Notes                                 |
| ----------------- | -------------------------------- | --------------------------------------------------- |
| **API**           | `http://localhost:3000`          | -                                                   |
| **Swagger UI**    | `http://localhost:3000/api/docs` | -                                                   |
| **pgAdmin**       | `http://localhost:5050`          | User: `admin@admin.com` / Pass: `root`              |
| **Postgres**      | `localhost:5432`                 | User: `admin` / Pass: `password` / Host: `postgres` |
| **Redis Insight** | `http://localhost:5540`          | -                                                   |

## API Documentation

Full API documentation is available via Swagger.

1. Start the application.
2. Navigate to `http://localhost:3000/api/docs`.

### Core Endpoints

**Shorten**

- `POST /api/v1/shorten` - Create a new shortened URL.
- `GET /api/v1/shorten/:shortCode` - Retrieve details for a short URL.
- `PATCH /api/v1/shorten/:shortCode` - Update the original URL of a short link.
- `DELETE /api/v1/shorten/:shortCode` - Delete a shortened URL.

**Redirect**

- `GET /:shortCode` - Redirect to the original URL and record click analytics.

**Metrics**

- `GET /api/v1/metrics/:shortCode` - Full analytics summary.
- `GET /api/v1/metrics/:shortCode/clicks` - Total click count.
- `GET /api/v1/metrics/:shortCode/countries` - Clicks grouped by country.
- `GET /api/v1/metrics/:shortCode/cities` - Clicks grouped by city.
- `GET /api/v1/metrics/:shortCode/browsers` - Clicks grouped by browser.
- `GET /api/v1/metrics/:shortCode/os` - Clicks grouped by operating system.
- `GET /api/v1/metrics/:shortCode/device-vendors` - Clicks grouped by device vendor.
- `GET /api/v1/metrics/:shortCode/device-models` - Clicks grouped by device model.

## Run Tests

```bash
docker compose exec url-shortening pnpm run test
```
