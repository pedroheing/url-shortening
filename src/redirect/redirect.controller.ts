import { Controller, Get, HttpRedirectResponse, HttpStatus, NotFoundException, Param, Redirect } from '@nestjs/common';
import { OriginalUrlNotFoundException } from './error/original-url-not-found.error';
import { RedirectService } from './redirect.service';

@Controller()
export class RedirectController {
	constructor(private readonly redirectService: RedirectService) {}

	@Get(':shortCode')
	@Redirect()
	public async redirect(@Param('shortCode') shortCode: string): Promise<HttpRedirectResponse> {
		try {
			const url = await this.redirectService.getOrignalUrl(shortCode);
			return { url, statusCode: HttpStatus.FOUND };
		} catch (error) {
			if (error instanceof OriginalUrlNotFoundException) {
				throw new NotFoundException();
			}
			throw error;
		}
	}
}
