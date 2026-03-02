import { Injectable } from '@nestjs/common';
import Redlock from 'redlock';
import { RedisService } from 'src/core/infra/redis/redis.service';
import { AcquiredLock, AcquireOptions, DistributedLockService } from '../../distributed-lock.interface';
import { RedlockAcquiredLock } from './redlock-acquired-lock';

@Injectable()
export class RedisDistributedLockService implements DistributedLockService {
	private readonly redlock: Redlock;

	constructor(redis: RedisService) {
		this.redlock = new Redlock([redis as any], {
			retryDelay: 200,
			retryJitter: 50,
		});
	}

	async acquire(key: string, options?: AcquireOptions): Promise<AcquiredLock> {
		options = {
			retryCount: options?.retryCount ?? -1,
			ttlMs: options?.ttlMs ?? 5000,
		};
		const lock = await this.redlock.acquire([key], options.ttlMs!, { retryCount: options.retryCount });
		return new RedlockAcquiredLock(lock, options.ttlMs!);
	}
}
