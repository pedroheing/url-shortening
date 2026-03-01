import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { Prisma } from 'generated/prisma/client';
import { UserAgent } from 'src/common/http/userAgent';
import { GeolocationService } from 'src/core/geolocation/geolocation.interface';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { ClicksQueueService } from './clicks-queue.service';
import { RegisterClickData } from './clicks.queue';

@Injectable()
export class ClicksWorker {
	constructor(
		private readonly clicksQueue: ClicksQueueService,
		private readonly prismaService: PrismaService,
		private readonly geolocationService: GeolocationService,
	) {}

	@Interval(100)
	async processQueue(): Promise<void> {
		const clicks = await this.clicksQueue.getBatch(1000);
		if (!clicks.length) return;
		await this.prismaService.clicks.createMany({
			data: clicks.map((click) => this.processClick(click)),
		});
	}

	private processClick(click: RegisterClickData): Prisma.clicksCreateManyInput {
		const geo = this.geolocationService.lookupIp(click.ip);
		const userAgent = UserAgent.parse(click.userAgent);
		return {
			short_url_id: click.shortUrlId,
			ip_address: click.ip,
			browser_name: userAgent.browser.name,
			browser_version: userAgent.browser.version,
			browser_version_major: userAgent.browser.major,
			country: geo?.country,
			region: geo?.region,
			city: geo?.city,
			device_model: userAgent.device.model,
			device_type: userAgent.device.type,
			device_vendor: userAgent.device.vendor,
			os: userAgent.os.name,
			os_version: userAgent.os.version,
			timezone: geo?.timezone,
		};
	}
}
