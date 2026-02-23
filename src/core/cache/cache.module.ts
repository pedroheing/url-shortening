import { Module } from '@nestjs/common';

import { createEnvProvider } from 'src/core/config/config-factory';
import { CacheService } from './cache.interface';
import { RedisConfigService, RedisEnv } from './providers/redis/redis-config.service';
import { RedisService } from './providers/redis/redis.service';

@Module({
	providers: [
		createEnvProvider(RedisEnv),
		RedisConfigService,
		{
			provide: CacheService,
			useClass: RedisService,
		},
	],
	exports: [CacheService],
})
export class CacheModule {}
