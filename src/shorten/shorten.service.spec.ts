import { Test } from '@nestjs/testing';
import { mock, mockDeep } from 'jest-mock-extended';
import { EncondingService } from 'src/core/enconding/enconding.service';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { SequenceService } from './services/sequence.service';
import { ShortenCacheService } from './services/shorten-cache.service';
import { ShortenConfigService } from './services/shorten-config.service';
import { ShortenService } from './shorten.service';

describe('ShortenService', () => {
	const SHORT_URL_BASE = 'https://short.co';
	const SHORT_CODE = 'abc123';
	const SHORT_URL = `${SHORT_URL_BASE}/${SHORT_CODE}`;

	const sequenceService = mock<SequenceService>();
	const shortenConfigService = mock<ShortenConfigService>({
		shortUrlBase: SHORT_URL_BASE,
	});
	const prismaService = mockDeep<PrismaService>();
	const encondingService = mock<EncondingService>();
	const shortenCacheService = mock<ShortenCacheService>();
	let shortenService: ShortenService;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [
				ShortenService,
				{ provide: PrismaService, useValue: prismaService },
				{ provide: SequenceService, useValue: sequenceService },
				{ provide: ShortenConfigService, useValue: shortenConfigService },
				{ provide: EncondingService, useValue: encondingService },
				{ provide: ShortenCacheService, useValue: shortenCacheService },
			],
		}).compile();
		shortenService = module.get(ShortenService);
	});

	it('should be defined', () => {
		expect(shortenService).toBeDefined();
	});

	describe('shorten', () => {
		it('should save the URL with the encoded short code, cache it and return ShortenResponse', async () => {
			const id = 1;
			const url = 'https://example.com';
			const record = { short_url_id: id, url, short_code: SHORT_CODE };

			sequenceService.getNextValue.mockResolvedValue(BigInt(1));
			encondingService.encondeBase62.mockReturnValue(SHORT_CODE);
			prismaService.short_urls.create.mockResolvedValue(record);

			const result = await shortenService.shorten(url);

			expect(result).toEqual({
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

	describe('update', () => {
		it('should update the URL in DB, update cache and return ShortenResponse', async () => {
			const id = 1;
			const url = 'https://new.example.com';
			const record = { short_url_id: id, url, short_code: SHORT_CODE };

			prismaService.short_urls.update.mockResolvedValue(record);

			const result = await shortenService.update(id, url);

			expect(result).toEqual({
				url: record.url,
				shortCode: record.short_code,
				shortUrl: SHORT_URL,
			});
			expect(prismaService.short_urls.update).toHaveBeenCalledWith({
				where: { short_url_id: id },
				data: { url },
			});
			expect(shortenCacheService.set).toHaveBeenCalledWith(SHORT_CODE, {
				shortUrlId: id,
				url,
			});
		});
	});

	describe('delete', () => {
		it('should delete the record, invalidate cache and return ShortenResponse', async () => {
			const id = 1;
			const url = 'https://example.com';
			const record = { short_url_id: id, url, short_code: SHORT_CODE };

			prismaService.short_urls.delete.mockResolvedValue(record);

			const result = await shortenService.delete(id);

			expect(result).toEqual({
				url: record.url,
				shortCode: record.short_code,
				shortUrl: SHORT_URL,
			});
			expect(prismaService.short_urls.delete).toHaveBeenCalledWith({ where: { short_url_id: id } });
			expect(shortenCacheService.invalidate).toHaveBeenCalledWith(SHORT_CODE);
		});
	});
});
