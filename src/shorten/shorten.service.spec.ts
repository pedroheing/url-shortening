import { Test } from '@nestjs/testing';
import { mock, mockDeep } from 'jest-mock-extended';
import { Base62 } from 'src/common/encoding/base62';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { SequenceService } from './services/sequence.service';
import { ShortenCacheService } from './services/shorten-cache.service';
import { ShortenConfigService } from './services/shorten-config.service';
import { ShortenService } from './shorten.service';

describe('ShortenService', () => {
	const SHORT_URL_BASE = 'https://short.co';
	const SEQUENCE_VALUE = BigInt(1);
	const SHORT_CODE = Base62.enconde(SEQUENCE_VALUE.toString());
	const SHORT_URL = `${SHORT_URL_BASE}/${SHORT_CODE}`;

	const sequenceService = mock<SequenceService>();
	const shortenConfigService = mock<ShortenConfigService>({
		shortUrlBase: SHORT_URL_BASE,
	});
	const prismaService = mockDeep<PrismaService>();
	const shortenCacheService = mock<ShortenCacheService>();
	let shortenService: ShortenService;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [
				ShortenService,
				{ provide: PrismaService, useValue: prismaService },
				{ provide: SequenceService, useValue: sequenceService },
				{ provide: ShortenConfigService, useValue: shortenConfigService },
				{ provide: ShortenCacheService, useValue: shortenCacheService },
			],
		}).compile();
		shortenService = module.get(ShortenService);
	});

	it('should be defined', () => {
		expect(shortenService).toBeDefined();
	});

	describe('shorten', () => {
		it('should save the URL with the encoded short code, cache it and return ShortenUrl', async () => {
			const id = 1;
			const url = 'https://example.com';
			const record = { short_url_id: id, url, short_code: SHORT_CODE };

			sequenceService.getNextValue.mockResolvedValue(SEQUENCE_VALUE);
			prismaService.short_urls.create.mockResolvedValue(record);

			const result = await shortenService.shorten(url);

			expect(result).toEqual({
				shortUrlId: id,
				url: record.url,
				shortCode: record.short_code,
				shortUrl: SHORT_URL,
			});
			expect(prismaService.short_urls.create).toHaveBeenCalledWith({
				data: { short_code: SHORT_CODE, url },
			});
			expect(shortenCacheService.set).toHaveBeenCalledWith(SHORT_CODE, {
				shortUrlId: id,
				url,
			});
		});

		it('should propagate error if sequence service fails', async () => {
			sequenceService.getNextValue.mockRejectedValue(new Error('sequence unavailable'));

			await expect(shortenService.shorten('https://example.com')).rejects.toThrow('sequence unavailable');
		});
	});

	describe('findByShortCode', () => {
		it('should return ShortenUrl when found', async () => {
			const id = 1;
			const url = 'https://example.com';
			const record = { short_url_id: id, url, short_code: SHORT_CODE };

			prismaService.short_urls.findUnique.mockResolvedValue(record);

			const result = await shortenService.findByShortCode(SHORT_CODE);

			expect(result).toEqual({
				shortUrlId: id,
				url,
				shortCode: SHORT_CODE,
				shortUrl: SHORT_URL,
			});
			expect(prismaService.short_urls.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { short_code: SHORT_CODE } }));
		});

		it('should return null when not found', async () => {
			prismaService.short_urls.findUnique.mockResolvedValue(null);

			const result = await shortenService.findByShortCode(SHORT_CODE);

			expect(result).toBeNull();
		});
	});

	describe('updateByShortCode', () => {
		it('should update the URL in DB, update cache and return ShortenUrl', async () => {
			const id = 1;
			const url = 'https://new.example.com';
			const record = { short_url_id: id, url, short_code: SHORT_CODE };

			prismaService.short_urls.update.mockResolvedValue(record);

			const result = await shortenService.updateByShortCode(SHORT_CODE, url);

			expect(result).toEqual({
				shortUrlId: id,
				url: record.url,
				shortCode: record.short_code,
				shortUrl: SHORT_URL,
			});
			expect(prismaService.short_urls.update).toHaveBeenCalledWith({
				where: { short_code: SHORT_CODE },
				data: { url },
			});
			expect(shortenCacheService.set).toHaveBeenCalledWith(SHORT_CODE, {
				shortUrlId: id,
				url,
			});
		});
	});

	describe('deleteByShortCode', () => {
		it('should delete the record, invalidate cache and return ShortenUrl', async () => {
			const id = 1;
			const url = 'https://example.com';
			const record = { short_url_id: id, url, short_code: SHORT_CODE };

			prismaService.short_urls.delete.mockResolvedValue(record);

			const result = await shortenService.deleteByShortCode(SHORT_CODE);

			expect(result).toEqual({
				shortUrlId: id,
				url: record.url,
				shortCode: record.short_code,
				shortUrl: SHORT_URL,
			});
			expect(prismaService.short_urls.delete).toHaveBeenCalledWith({ where: { short_code: SHORT_CODE } });
			expect(shortenCacheService.invalidate).toHaveBeenCalledWith(SHORT_CODE);
		});
	});
});
