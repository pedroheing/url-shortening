import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';
import { RequestIp } from 'src/common/http/request-ip';

export const GLOBAL_KEY_THROTTLE = 'global';

@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
	// eslint-disable-next-line @typescript-eslint/require-await
	protected async getTracker(req: Request): Promise<string> {
		return RequestIp.extract(req);
	}

	protected generateKey(context: ExecutionContext, suffix: string, name: string): string {
		if (name === GLOBAL_KEY_THROTTLE) return GLOBAL_KEY_THROTTLE;
		return super.generateKey(context, suffix, name);
	}
}
