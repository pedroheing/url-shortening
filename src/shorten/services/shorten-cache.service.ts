import { Injectable } from '@nestjs/common';
import { CacheService } from 'src/core/cache/cache.interface';
import { ShortenConfigService } from './shorten-config.service';

export interface ShortUrlCache {
	shortUrlId: number;
	url: string;
}

@Injectable()
export class ShortenCacheService {
	constructor(
		private readonly cacheService: CacheService,
		private readonly shortenConfigService: ShortenConfigService,
	) {}

	public async get(shortCode: string): Promise<ShortUrlCache | null> {
		const shortUrl = await this.cacheService.get(this.buildKey(shortCode));
		if (!shortUrl) {
			return null;
		}
		return JSON.parse(shortUrl) as ShortUrlCache;
	}

	public async set(shortCode: string, shortUrl: ShortUrlCache): Promise<void> {
		await this.cacheService.set(this.buildKey(shortCode), JSON.stringify(shortUrl), this.shortenConfigService.shortUrlCacheTTLSeconds);
	}

	public async invalidate(shortCode: string): Promise<void> {
		await this.cacheService.delete(this.buildKey(shortCode));
	}

	public async refreshTTL(shortCode: string): Promise<void> {
		await this.cacheService.setExpiration(this.buildKey(shortCode), this.shortenConfigService.shortUrlCacheTTLSeconds);
	}

	private buildKey(shortCode: string): string {
		return `shortUrl:${shortCode}`;
	}
}
