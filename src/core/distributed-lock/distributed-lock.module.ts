import { Module } from '@nestjs/common';
import { RedisModule } from 'src/core/infra/redis/redis.module';
import { DistributedLockService } from './distributed-lock.interface';
import { RedisDistributedLockService } from './providers/redis/redis-distributed-lock.service';

@Module({
	imports: [RedisModule],
	providers: [
		{
			provide: DistributedLockService,
			useClass: RedisDistributedLockService,
		},
	],
	exports: [DistributedLockService],
})
export class DistributedLockModule {}
