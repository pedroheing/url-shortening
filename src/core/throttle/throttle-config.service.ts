import { Injectable } from '@nestjs/common';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class ThrottleEnv {
	@IsNotEmpty()
	@IsNumber()
	readonly THROTTLE_IP_TTL!: number;

	@IsNotEmpty()
	@IsNumber()
	readonly THROTTLE_IP_LIMIT!: number;

	@IsNotEmpty()
	@IsNumber()
	readonly THROTTLE_GLOBAL_TTL!: number;

	@IsNotEmpty()
	@IsNumber()
	readonly THROTTLE_GLOBAL_LIMIT!: number;
}

interface ThrottleConfig {
	ttl: number;
	limit: number;
}

@Injectable()
export class ThrottleConfigService {
	public readonly ip: ThrottleConfig;
	public readonly global: ThrottleConfig;

	constructor(config: ThrottleEnv) {
		this.ip = {
			limit: config.THROTTLE_IP_LIMIT,
			ttl: config.THROTTLE_IP_TTL,
		};
		this.global = {
			limit: config.THROTTLE_GLOBAL_LIMIT,
			ttl: config.THROTTLE_GLOBAL_TTL,
		};
	}
}
