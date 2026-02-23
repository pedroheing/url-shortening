import { Test } from '@nestjs/testing';
import { mock } from 'jest-mock-extended';
import { ShortenCacheService } from 'src/shorten/services/shorten-cache.service';
import { ShortenService } from 'src/shorten/shorten.service';
import { OriginalUrlNotFoundException } from './error/original-url-not-found.error';
import { RedirectService } from './redirect.service';

describe('RedirectService', () => {
	let redirectService: RedirectService;
	const shortenService = mock<ShortenService>();
	const shortenCacheService = mock<ShortenCacheService>();

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [
				RedirectService,
				{ provide: ShortenService, useValue: shortenService },
				{ provide: ShortenCacheService, useValue: shortenCacheService },
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

		it('should return URL from cache and refresh TTL on cache hit', async () => {
			shortenCacheService.get.mockResolvedValue(originalUrl);

			const result = await redirectService.getOrignalUrl(shortCode);

			expect(result).toBe(originalUrl);
			expect(shortenCacheService.get).toHaveBeenCalledWith(shortCode);
			expect(shortenCacheService.refreshTTL).toHaveBeenCalledWith(shortCode);
			expect(shortenService.findByShortCode).not.toHaveBeenCalled();
		});

		it('should return URL from DB, populate cache and skip TTL refresh on cache miss', async () => {
			shortenCacheService.get.mockResolvedValue(null);
			shortenService.findByShortCode.mockResolvedValue({ id: 1, short_code: '', access_count: 1, url: originalUrl });

			const result = await redirectService.getOrignalUrl(shortCode);

			expect(result).toBe(originalUrl);
			expect(shortenService.findByShortCode).toHaveBeenCalledWith(shortCode);
			expect(shortenCacheService.set).toHaveBeenCalledWith(shortCode, originalUrl);
			expect(shortenCacheService.refreshTTL).not.toHaveBeenCalled();
		});

		it('should throw OriginalUrlNotFoundException when not found in cache or DB', async () => {
			shortenCacheService.get.mockResolvedValue(null);
			shortenService.findByShortCode.mockResolvedValue(null);

			await expect(redirectService.getOrignalUrl(shortCode)).rejects.toThrow(OriginalUrlNotFoundException);
			expect(shortenCacheService.set).not.toHaveBeenCalled();
		});
	});
});
