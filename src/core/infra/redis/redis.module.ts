import { Module } from '@nestjs/common';
import { createEnvProvider } from 'src/core/config/config-factory';
import { RedisConfigService, RedisEnv } from './redis-config.service';
import { RedisService } from './redis.service';

@Module({
	providers: [createEnvProvider(RedisEnv), RedisConfigService, RedisService],
	exports: [RedisService],
})
export class RedisModule {}
