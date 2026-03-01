import { Test } from '@nestjs/testing';
import { mock } from 'jest-mock-extended';
import { GeolocationService } from 'src/core/geolocation/geolocation.interface';
import { ClicksQueueService } from 'src/metrics/queues/clicks/clicks-queue.service';
import { ShortUrlCache, ShortenCacheService } from 'src/shorten/services/shorten-cache.service';
import { ShortenService } from 'src/shorten/shorten.service';
import { OriginalUrlNotFoundException } from './error/original-url-not-found.error';
import { RedirectService } from './redirect.service';

describe('RedirectService', () => {
	let redirectService: RedirectService;
	const shortenService = mock<ShortenService>();
	const shortenCacheService = mock<ShortenCacheService>();
	const clicksQueueService = mock<ClicksQueueService>();
	const geolocationService = mock<GeolocationService>();

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [
				RedirectService,
				{ provide: ShortenService, useValue: shortenService },
				{ provide: ShortenCacheService, useValue: shortenCacheService },
				{ provide: ClicksQueueService, useValue: clicksQueueService },
				{ provide: GeolocationService, useValue: geolocationService },
			],
		}).compile();
		redirectService = module.get(RedirectService);
	});

	it('should be defined', () => {
		expect(redirectService).toBeDefined();
	});

	describe('getOrignalUrl', () => {
		const shortCode = 'abc123';
		const originalUrl = 'https://test.com';
		const ip = '127.0.0.1';
		const userAgent = '';
		const cachedShortUrl: ShortUrlCache = { shortUrlId: 1, url: originalUrl };

		it('should return URL from cache and refresh TTL on cache hit', async () => {
			shortenCacheService.get.mockResolvedValue(cachedShortUrl);
			clicksQueueService.add.mockResolvedValue(undefined);

			const result = await redirectService.resolveAcess(shortCode, ip, userAgent);

			expect(result).toBe(originalUrl);
			expect(shortenCacheService.get).toHaveBeenCalledWith(shortCode);
			expect(shortenCacheService.refreshTTL).toHaveBeenCalledWith(shortCode);
			expect(shortenService.findByShortCode).not.toHaveBeenCalled();
		});

		it('should return URL from DB, populate cache and skip TTL refresh on cache miss', async () => {
			shortenCacheService.get.mockResolvedValue(null);
			shortenService.findByShortCode.mockResolvedValue({ shortUrlId: 1, shortCode, url: originalUrl, shortUrl: '' });
			clicksQueueService.add.mockResolvedValue(undefined);

			const result = await redirectService.resolveAcess(shortCode, ip, userAgent);

			expect(result).toBe(originalUrl);
			expect(shortenService.findByShortCode).toHaveBeenCalledWith(shortCode);
			expect(shortenCacheService.set).toHaveBeenCalledWith(shortCode, cachedShortUrl);
			expect(shortenCacheService.refreshTTL).not.toHaveBeenCalled();
		});

		it('should throw OriginalUrlNotFoundException when not found in cache or DB', async () => {
			shortenCacheService.get.mockResolvedValue(null);
			shortenService.findByShortCode.mockResolvedValue(null);

			await expect(redirectService.resolveAcess(shortCode, ip, userAgent)).rejects.toThrow(OriginalUrlNotFoundException);
			expect(shortenCacheService.set).not.toHaveBeenCalled();
		});
	});
});
