import { Injectable } from '@nestjs/common';
import { ShortenCacheService } from 'src/shorten/services/shorten-cache.service';
import { ShortenService } from 'src/shorten/shorten.service';
import { OriginalUrlNotFoundException } from './error/original-url-not-found.error';

@Injectable()
export class RedirectService {
	constructor(
		private readonly shortenService: ShortenService,
		private readonly shortenCacheService: ShortenCacheService,
	) {}

	public async getOrignalUrl(shortCode: string): Promise<string> {
		const originalUrl = await this.getOriginalUrlFromCacheOrDatabase(shortCode);
		if (!originalUrl) {
			throw new OriginalUrlNotFoundException(`Cannot find original URL with code ${shortCode}`);
		}
		return originalUrl;
	}

	private async getOriginalUrlFromCacheOrDatabase(shortCode: string): Promise<string | null> {
		const cachedUrl = await this.shortenCacheService.get(shortCode);
		if (cachedUrl) {
			await this.shortenCacheService.refreshTTL(shortCode);
			return cachedUrl;
		}
		const shortUrl = await this.shortenService.findByShortCode(shortCode);
		if (shortUrl) {
			await this.shortenCacheService.set(shortCode, shortUrl.url);
		}
		return shortUrl?.url ?? null;
	}
}
