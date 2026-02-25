import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Prisma } from 'generated/prisma/client';
import { mock } from 'jest-mock-extended';
import { ShortenController } from './shorten.controller';
import { ShortenService } from './shorten.service';

const p2025Error = new Prisma.PrismaClientKnownRequestError('Record not found', {
	code: 'P2025',
	clientVersion: '0.0.0',
});

describe('ShortenController', () => {
	let shortenController: ShortenController;
	const shortenService = mock<ShortenService>();

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [
				ShortenController,
				{
					provide: ShortenService,
					useValue: shortenService,
				},
			],
		}).compile();
		shortenController = module.get(ShortenController);
	});

	it('should be defined', () => {
		expect(shortenController).toBeDefined();
	});

	describe('shorten', () => {
		it('should create a short URL and return it', async () => {
			const url = 'https://example.com.br';
			const shortenUrlResult = {
				shortUrlId: 1,
				url: 'https://test.com.br',
				shortCode: '123456',
				shortUrl: 'https://short.com.br/123456',
			};
			shortenService.shorten.mockResolvedValue(shortenUrlResult);

			const resp = await shortenController.shorten({ url });

			expect(shortenService.shorten).toHaveBeenCalledWith(url);
			expect(resp).toMatchObject({ url: shortenUrlResult.url, shortCode: shortenUrlResult.shortCode });
		});
	});

	describe('find', () => {
		it('should return the shortened URL data', async () => {
			const shortCode = 'abc123';
			const shortenUrlResult = {
				shortUrlId: 1,
				url: 'https://test.com.br',
				shortCode,
				shortUrl: 'https://short.co/abc123',
			};
			shortenService.findByShortCode.mockResolvedValue(shortenUrlResult);

			const result = await shortenController.find(shortCode);

			expect(result).toMatchObject({ url: shortenUrlResult.url, shortCode });
			expect(shortenService.findByShortCode).toHaveBeenCalledWith(shortCode);
		});

		it('should throw NotFoundException when not found', async () => {
			shortenService.findByShortCode.mockResolvedValue(null);

			await expect(shortenController.find('abc123')).rejects.toThrow(NotFoundException);
		});
	});

	describe('update', () => {
		it('should update the short URL and return it', async () => {
			const shortCode = 'abc123';
			const url = 'https://new.example.com';
			const result = { shortUrlId: 1, url, shortCode, shortUrl: 'https://short.co/abc123' };
			shortenService.updateByShortCode.mockResolvedValue(result);

			const resp = await shortenController.update(shortCode, { url });

			expect(shortenService.updateByShortCode).toHaveBeenCalledWith(shortCode, url);
			expect(resp).toMatchObject({ url, shortCode });
		});

		it('should throw NotFoundException on P2025 error', async () => {
			shortenService.updateByShortCode.mockRejectedValue(p2025Error);

			await expect(shortenController.update('abc123', { url: 'https://example.com' })).rejects.toThrow(NotFoundException);
		});
	});

	describe('delete', () => {
		it('should delete the short URL', async () => {
			const shortCode = 'abc123';
			shortenService.deleteByShortCode.mockResolvedValue({} as any);

			await shortenController.delete(shortCode);

			expect(shortenService.deleteByShortCode).toHaveBeenCalledWith(shortCode);
		});

		it('should throw NotFoundException on P2025 error', async () => {
			shortenService.deleteByShortCode.mockRejectedValue(p2025Error);

			await expect(shortenController.delete('abc123')).rejects.toThrow(NotFoundException);
		});
	});
});
