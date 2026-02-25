import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { ClicksQueueService } from './clicks-queue.service';
import { RegisterClickData } from './clicks.queue';

@Injectable()
export class ClicksWorker {
	constructor(
		private readonly clicksQueue: ClicksQueueService,
		private readonly prismaService: PrismaService,
	) {}

	@Interval(1000)
	async processQueue(): Promise<void> {
		const clicks = await this.clicksQueue.getBatch(100);
		if (!clicks.length) return;
		await this.prismaService.clicks.createMany({
			data: clicks.map((click: RegisterClickData) => {
				return {
					short_url_id: click.shortUrlId,
					ip_address: click.ip,
					browser_name: click.userAgent.browser.name,
					browser_version: click.userAgent.browser.version,
					browser_version_major: click.userAgent.browser.major,
					country: click.geo?.contry,
					region: click.geo?.region,
					city: click.geo?.city,
					device_model: click.userAgent.device.model,
					device_type: click.userAgent.device.type,
					device_vendor: click.userAgent.device.vendor,
					os: click.userAgent.os.name,
					os_version: click.userAgent.os.version,
					timezone: click.geo?.timezone,
				};
			}) as Prisma.clicksCreateManyInput[],
		});
	}
}
