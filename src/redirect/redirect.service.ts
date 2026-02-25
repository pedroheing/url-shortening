import { Injectable } from '@nestjs/common';
import { UserAgentResult } from 'src/common/decorators/user-agent.decorator';
import { GeolocationService } from 'src/core/geolocation/geolocation.interface';
import { ClicksQueueService } from 'src/metrics/queues/clicks/clicks-queue.service';
import { ShortenCacheService, ShortUrlCache } from 'src/shorten/services/shorten-cache.service';
import { ShortenService } from 'src/shorten/shorten.service';
import { OriginalUrlNotFoundException } from './error/original-url-not-found.error';

@Injectable()
export class RedirectService {
	constructor(
		private readonly shortenService: ShortenService,
		private readonly shortenCacheService: ShortenCacheService,
		private readonly clicksQueue: ClicksQueueService,
		private readonly geolocationService: GeolocationService,
	) {}

	public async resolveAcess(shortCode: string, ip: string, userAgent: UserAgentResult): Promise<string> {
		const shortUrl = await this.getOriginalUrlFromCacheOrDatabase(shortCode);
		if (!shortUrl) {
			throw new OriginalUrlNotFoundException(`Cannot find original URL with code ${shortCode}`);
		}
		await this.registerClick(shortUrl, ip, userAgent);
		return shortUrl.url;
	}

	private async registerClick(shortUrl: ShortUrlCache, ip: string, userAgent: UserAgentResult): Promise<void> {
		const geo = this.geolocationService.lookupIp(ip);
		await this.clicksQueue.add({
			shortUrlId: shortUrl.shortUrlId,
			geo: geo,
			ip: ip,
			userAgent: userAgent,
		});
	}

	private async getOriginalUrlFromCacheOrDatabase(shortCode: string): Promise<ShortUrlCache | null> {
		const cachedShortUrl = await this.shortenCacheService.get(shortCode);
		if (cachedShortUrl) {
			await this.shortenCacheService.refreshTTL(shortCode);
			return cachedShortUrl;
		}
		const shortUrl = await this.shortenService.findByShortCode(shortCode);
		if (!shortUrl) {
			return null;
		}
		const shortUrlCache: ShortUrlCache = {
			shortUrlId: shortUrl.short_url_id,
			url: shortUrl.url,
		};
		await this.shortenCacheService.set(shortCode, shortUrlCache);
		return shortUrlCache;
	}
}
