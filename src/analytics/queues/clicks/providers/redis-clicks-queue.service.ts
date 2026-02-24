import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/core/infra/redis/redis.service';
import { ClicksQueueService } from '../clicks-queue.service';
import { CLICKS_QUEUE_KEY, RegisterClickData } from '../clicks.queue';

@Injectable()
export class RedisClicksQueueService implements ClicksQueueService {
	constructor(private readonly redis: RedisService) {}

	async add(data: RegisterClickData): Promise<void> {
		await this.redis.lpush(CLICKS_QUEUE_KEY, JSON.stringify(data));
	}

	async getBatch(count: number): Promise<RegisterClickData[]> {
		const clicks = await this.redis.rpop(CLICKS_QUEUE_KEY, count);
		if (!clicks) {
			return [];
		}
		return clicks.map((item) => JSON.parse(item) as RegisterClickData);
	}
}
