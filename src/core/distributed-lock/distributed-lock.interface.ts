export interface AcquiredLock {
	release(): Promise<void>;
}

export interface AcquireOptions {
	ttlMs?: number;
	retryCount?: number;
}

export abstract class DistributedLockService {
	abstract acquire(key: string, options?: AcquireOptions): Promise<AcquiredLock>;
}
