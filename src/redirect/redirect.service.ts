import { Injectable } from '@nestjs/common';
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
	) {}

	public async resolveAcess(shortCode: string, ip: string, userAgent: string): Promise<string> {
		const shortUrl = await this.getOriginalUrlFromCacheOrDatabase(shortCode);
		if (!shortUrl) {
			throw new OriginalUrlNotFoundException(`Cannot find original URL with code ${shortCode}`);
		}
		this.registerClick(shortUrl, ip, userAgent);
		return shortUrl.url;
	}

	private registerClick(shortUrl: ShortUrlCache, ip: string, userAgent: string) {
		void this.clicksQueue.add({
			shortUrlId: shortUrl.shortUrlId,
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
			shortUrlId: shortUrl.shortUrlId,
			url: shortUrl.url,
		};
		await this.shortenCacheService.set(shortCode, shortUrlCache);
		return shortUrlCache;
	}
}
