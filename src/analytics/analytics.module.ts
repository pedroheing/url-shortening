import { Module } from '@nestjs/common';
import { RedisModule } from 'src/core/infra/redis/redis.module';
import { PrismaModule } from 'src/core/prisma/prisma.module';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { ClicksQueueService } from './queues/clicks/clicks-queue.service';
import { ClicksWorker } from './queues/clicks/clicks.worker';
import { RedisClicksQueueService } from './queues/clicks/providers/redis-clicks-queue.service';

@Module({
	imports: [RedisModule, PrismaModule],
	providers: [AnalyticsService, ClicksWorker, { provide: ClicksQueueService, useClass: RedisClicksQueueService }],
	controllers: [AnalyticsController],
	exports: [ClicksQueueService],
})
export class AnalyticsModule {}
