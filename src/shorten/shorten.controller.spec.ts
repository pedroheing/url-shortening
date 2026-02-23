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
			const shortenUrlResult = { url: 'https://test.com.br', short_code: '123456', id: 1, short_url: 'https://short.com.br/1234', access_count: 0 };
			shortenService.shorten.mockResolvedValue(shortenUrlResult);

			const resp = await shortenController.shorten({ url });

			expect(shortenService.shorten).toHaveBeenCalledWith(url);
			expect(resp).toMatchObject(shortenUrlResult);
		});
	});

	describe('find', () => {
		it('should return the shorten URL data', async () => {
			const id = 1;
			const shortenUrlResult = { url: 'https://test.com.br', short_code: '123456', id: 1, short_url: 'https://short.com.br/1234', access_count: 0 };
			shortenService.find.mockResolvedValue(shortenUrlResult);

			const shortenUrl = await shortenController.find(id);

			expect(shortenUrl).toMatchObject(shortenUrlResult);
			expect(shortenService.find).toHaveBeenCalledWith(id);
		});

		it('should throw NotFoundException when it does not find the shorten URL', async () => {
			shortenService.find.mockResolvedValue(null);
			await expect(async () => {
				await shortenController.find(1);
			}).rejects.toThrow(NotFoundException);
		});
	});

	describe('update', () => {
		it('should update the short URL and return it', async () => {
			const id = 1;
			const url = 'https://new.example.com';
			const result = { id, url, short_code: 'abc123', access_count: 0, short_url: 'https://short.co/abc123' };
			shortenService.update.mockResolvedValue(result);

			const resp = await shortenController.update(id, { url });

			expect(shortenService.update).toHaveBeenCalledWith(id, url);
			expect(resp).toMatchObject(result);
		});

		it('should throw NotFoundException on P2025 error', async () => {
			shortenService.update.mockRejectedValue(p2025Error);

			await expect(shortenController.update(1, { url: 'https://example.com' })).rejects.toThrow(NotFoundException);
		});
	});

	describe('delete', () => {
		it('should delete the short URL', async () => {
			const id = 1;
			shortenService.delete.mockResolvedValue({} as any);

			await shortenController.delete(id);

			expect(shortenService.delete).toHaveBeenCalledWith(id);
		});

		it('should throw NotFoundException on P2025 error', async () => {
			shortenService.delete.mockRejectedValue(p2025Error);

			await expect(shortenController.delete(1)).rejects.toThrow(NotFoundException);
		});
	});
});
