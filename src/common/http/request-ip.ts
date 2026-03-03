import { getClientIp } from '@supercharge/request-ip';
import { Request } from 'express';

export class RequestIp {
	static extract(req: Request): string {
		return getClientIp(req) ?? req.ip ?? 'unknown';
	}
}
