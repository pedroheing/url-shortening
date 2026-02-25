import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/core/infra/redis/redis.service';
import { CacheService } from '../../cache.interface';

@Injectable()
export class RedisCacheService implements CacheService {
	constructor(private readonly redis: RedisService) {}

	async get(key: string): Promise<string | null> {
		return this.redis.get(key);
	}

	async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
		if (ttlSeconds) {
			await this.redis.set(key, value, 'EX', ttlSeconds);
		} else {
			await this.redis.set(key, value);
		}
	}

	async delete(keys: string | string[]): Promise<boolean> {
		if (!Array.isArray(keys)) {
			keys = [keys];
		}
		const res = await this.redis.unlink(keys);
		return res === 1;
	}

	async setExpiration(key: string, ttlSeconds: number): Promise<boolean> {
		const result = await this.redis.expire(key, ttlSeconds);
		return result === 1;
	}
}
