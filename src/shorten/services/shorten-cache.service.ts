import { Injectable } from '@nestjs/common';
import { CacheService } from 'src/core/cache/cache.interface';
import { ShortenConfigService } from './shorten-config.service';

export interface ShortUrlCache {
	shortUrlId: number;
	url: string;
}

export enum CacheEntryType {
	Negative,
	Positive,
}

export interface ShortCodeCachePositiveEntry {
	type: CacheEntryType.Positive;
	data: ShortUrlCache;
}

export interface ShortCodeCacheNegativeEntry {
	type: CacheEntryType.Negative;
}

export type ShortCodeCacheEntry = ShortCodeCachePositiveEntry | ShortCodeCacheNegativeEntry;

@Injectable()
export class ShortenCacheService {
	constructor(
		private readonly cacheService: CacheService,
		private readonly shortenConfigService: ShortenConfigService,
	) {}

	public async get(shortCode: string): Promise<ShortCodeCacheEntry | null> {
		const shortUrl = await this.cacheService.get(this.buildKey(shortCode));
		if (!shortUrl) {
			return null;
		}
		return JSON.parse(shortUrl) as ShortCodeCacheEntry;
	}

	public async set(shortCode: string, shortUrl: ShortUrlCache): Promise<void> {
		const data: ShortCodeCacheEntry = {
			type: CacheEntryType.Positive,
			data: shortUrl,
		};
		await this.cacheService.set(this.buildKey(shortCode), JSON.stringify(data), this.shortenConfigService.shortUrlCacheTTLSeconds);
	}

	public async markAsDeleted(shortCode: string): Promise<void> {
		const data: ShortCodeCacheEntry = {
			type: CacheEntryType.Negative,
		};
		await this.cacheService.set(this.buildKey(shortCode), JSON.stringify(data));
	}

	public async refreshTTL(shortCode: string): Promise<void> {
		await this.cacheService.setExpiration(this.buildKey(shortCode), this.shortenConfigService.shortUrlCacheTTLSeconds);
	}

	private buildKey(shortCode: string): string {
		return `shortUrl:${shortCode}`;
	}
}
