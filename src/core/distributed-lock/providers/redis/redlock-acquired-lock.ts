import { Lock } from 'redlock';
import { AcquiredLock } from '../../distributed-lock.interface';

export class RedlockAcquiredLock implements AcquiredLock {
	private renewInterval: NodeJS.Timeout | null = null;

	constructor(
		private lock: Lock,
		private readonly ttlMs: number,
	) {
		this.startAutoRenew();
	}

	private startAutoRenew(): void {
		const renewPeriodMs = Math.floor(this.ttlMs / 2);
		if (renewPeriodMs <= 0) return;
		this.renewInterval = setInterval(() => void this.renewLock(), renewPeriodMs);
	}

	private stopAutoRenew(): void {
		if (this.renewInterval) {
			clearInterval(this.renewInterval);
			this.renewInterval = null;
		}
	}

	private async renewLock(): Promise<void> {
		try {
			this.lock = await this.lock.extend(this.ttlMs);
		} catch {
			this.stopAutoRenew();
		}
	}

	async release(): Promise<void> {
		this.stopAutoRenew();
		await this.lock.release();
	}
}
