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

		it('should return a redirect response with FOUND status', async () => {
			redirectService.getOrignalUrl.mockResolvedValue(originalUrl);

			const result = await redirectController.redirect(shortCode);

			expect(result).toEqual({ url: originalUrl, statusCode: HttpStatus.FOUND });
			expect(redirectService.getOrignalUrl).toHaveBeenCalledWith(shortCode);
		});

		it('should throw NotFoundException when short code is not found', async () => {
			redirectService.getOrignalUrl.mockRejectedValue(new OriginalUrlNotFoundException());

			await expect(redirectController.redirect(shortCode)).rejects.toThrow(NotFoundException);
		});
	});
});
