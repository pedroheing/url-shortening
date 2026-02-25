import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { RedisConfigService } from './redis-config.service';

@Injectable()
export class RedisService extends Redis implements OnModuleInit, OnModuleDestroy {
	constructor(config: RedisConfigService) {
		super({
			host: config.host,
			port: config.port,
			lazyConnect: true,
		});
	}

	async onModuleInit() {
		await this.connect();
	}

	async onModuleDestroy() {
		await this.quit();
	}
}
