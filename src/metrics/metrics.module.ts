import { Module } from '@nestjs/common';
import { RedisModule } from 'src/core/infra/redis/redis.module';
import { PrismaModule } from 'src/core/prisma/prisma.module';
import { ShortenModule } from 'src/shorten/shorten.module';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';
import { ClicksQueueService } from './queues/clicks/clicks-queue.service';
import { ClicksWorker } from './queues/clicks/clicks.worker';
import { RedisClicksQueueService } from './queues/clicks/providers/redis-clicks-queue.service';

@Module({
	imports: [RedisModule, PrismaModule, ShortenModule],
	providers: [MetricsService, ClicksWorker, { provide: ClicksQueueService, useClass: RedisClicksQueueService }],
	controllers: [MetricsController],
	exports: [ClicksQueueService],
})
export class MetricsModule {}
