import { Module } from '@nestjs/common';
import { RedisModule } from 'src/core/infra/redis/redis.module';
import { CacheService } from './cache.interface';
import { RedisCacheService } from './providers/redis/redis-cache.service';

@Module({
	imports: [RedisModule],
	providers: [
		{
			provide: CacheService,
			useClass: RedisCacheService,
		},
	],
	exports: [CacheService],
})
export class CacheModule {}
