import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { CacheService } from '../../cache.interface';
import { RedisConfigService } from './redis-config.service';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy, CacheService {
	private client: Redis;

	constructor(redisConfigService: RedisConfigService) {
		this.client = new Redis({
			host: redisConfigService.host,
			port: redisConfigService.port,
			lazyConnect: true,
		});
	}

	async onModuleInit() {
		await this.client.connect();
	}

	async onModuleDestroy() {
		await this.client.quit();
	}

	async get(key: string): Promise<string | null> {
		return this.client.get(key);
	}

	async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
		if (ttlSeconds) {
			await this.client.set(key, value, 'EX', ttlSeconds);
		} else {
			await this.client.set(key, value);
		}
	}

	async delete(keys: string | string[]): Promise<boolean> {
		if (!Array.isArray(keys)) {
			keys = [keys];
		}
		const res = await this.client.unlink(keys);
		return res === 1;
	}

	async setExpiration(key: string, ttlSeconds: number): Promise<boolean> {
		const result = await this.client.expire(key, ttlSeconds);
		return result === 1;
	}
}
