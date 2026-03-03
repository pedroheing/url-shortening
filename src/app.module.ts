import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { RedisModule } from './core/infra/redis/redis.module';
import { RedisService } from './core/infra/redis/redis.service';
import { AppThrottlerGuard, GLOBAL_KEY_THROTTLE } from './core/throttle/app-throttler.guard';
import { ThrottleConfigService } from './core/throttle/throttle-config.service';
import { ThrottleModule } from './core/throttle/throttle.module';
import { MetricsModule } from './metrics/metrics.module';
import { RedirectModule } from './redirect/redirect.module';
import { ShortenModule } from './shorten/shorten.module';

@Module({
	imports: [
		ConfigModule.forRoot(),
		ScheduleModule.forRoot(),
		ThrottlerModule.forRootAsync({
			imports: [RedisModule, ThrottleModule],
			inject: [RedisService, ThrottleConfigService],
			useFactory: (redis: RedisService, throttleConfigService: ThrottleConfigService) => ({
				storage: new ThrottlerStorageRedisService(redis),
				throttlers: [
					{ name: 'ip', ttl: throttleConfigService.ip.ttl, limit: throttleConfigService.ip.limit },
					{ name: GLOBAL_KEY_THROTTLE, ttl: throttleConfigService.global.ttl, limit: throttleConfigService.global.limit },
				],
			}),
		}),
		ShortenModule,
		RedirectModule,
		MetricsModule,
	],
	providers: [{ provide: APP_GUARD, useClass: AppThrottlerGuard }],
})
export class AppModule {}
