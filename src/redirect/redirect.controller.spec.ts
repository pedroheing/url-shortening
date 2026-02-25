import { HttpStatus, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { mock } from 'jest-mock-extended';
import { OriginalUrlNotFoundException } from './error/original-url-not-found.error';
import { RedirectController } from './redirect.controller';
import { RedirectService } from './redirect.service';

describe('RedirectController', () => {
	let redirectController: RedirectController;
	const redirectService = mock<RedirectService>();

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [RedirectController, { provide: RedirectService, useValue: redirectService }],
		}).compile();
		redirectController = module.get(RedirectController);
	});

	it('should be defined', () => {
		expect(redirectController).toBeDefined();
	});

	describe('redirect', () => {
		const shortCode = 'abc123';
		const originalUrl = 'https://test.com';
		const ip = '127.0.0.1';
		const userAgent = { browser: {}, device: {}, os: {} };

		it('should return a redirect response with FOUND status', async () => {
			redirectService.resolveAcess.mockResolvedValue(originalUrl);

			const result = await redirectController.redirect(shortCode, ip, userAgent);

			expect(result).toEqual({ url: originalUrl, statusCode: HttpStatus.FOUND });
			expect(redirectService.resolveAcess).toHaveBeenCalledWith(shortCode, ip, userAgent);
		});

		it('should throw NotFoundException when short code is not found', async () => {
			redirectService.resolveAcess.mockRejectedValue(new OriginalUrlNotFoundException());

			await expect(redirectController.redirect(shortCode, ip, userAgent)).rejects.toThrow(NotFoundException);
		});
	});
});
