import { Injectable, Logger } from '@nestjs/common';
import { DistributedLockService } from 'src/core/distributed-lock/distributed-lock.interface';
import { ClicksQueueService } from 'src/metrics/queues/clicks/clicks-queue.service';
import { ShortenCacheService, ShortUrlCache } from 'src/shorten/services/shorten-cache.service';
import { ShortenService } from 'src/shorten/shorten.service';
import { OriginalUrlNotFoundException } from './error/original-url-not-found.error';

@Injectable()
export class RedirectService {
	private readonly logger = new Logger(RedirectService.name);

	constructor(
		private readonly shortenService: ShortenService,
		private readonly shortenCacheService: ShortenCacheService,
		private readonly clicksQueue: ClicksQueueService,
		private readonly distributedLockService: DistributedLockService,
	) {}

	public async resolveAccess(shortCode: string, ip: string, userAgent: string): Promise<string> {
		const shortUrl = await this.getShortUrlFromCacheOrDb(shortCode);
		if (!shortUrl) {
			throw new OriginalUrlNotFoundException(`Cannot find original URL with code ${shortCode}`);
		}
		this.registerClick(shortUrl, ip, userAgent);
		return shortUrl.url;
	}

	private registerClick(shortUrl: ShortUrlCache, ip: string, userAgent: string): void {
		// fire and forget for performance
		this.clicksQueue
			.add({
				shortUrlId: shortUrl.shortUrlId,
				ip: ip,
				userAgent: userAgent,
			})
			.catch((err) => this.logger.error('Error adding click event to queue: ' + err));
	}

	private async getShortUrlFromCacheOrDb(shortCode: string): Promise<ShortUrlCache | null> {
		const cachedShortUrl = await this.shortenCacheService.get(shortCode);
		if (cachedShortUrl) {
			return cachedShortUrl;
		}
		const lock = await this.distributedLockService.acquire(`shortUrl:${shortCode}:dblock`);
		try {
			const cachedShortUrl = await this.shortenCacheService.get(shortCode);
			if (cachedShortUrl) {
				return cachedShortUrl;
			}
			const shortUrl = await this.shortenService.findByShortCode(shortCode);
			if (!shortUrl) {
				return null;
			}
			const shortUrlCache: ShortUrlCache = {
				shortUrlId: shortUrl.shortUrlId,
				url: shortUrl.url,
			};
			await this.shortenCacheService.set(shortCode, shortUrlCache);
			return shortUrlCache;
		} finally {
			await lock.release();
		}
	}
}
