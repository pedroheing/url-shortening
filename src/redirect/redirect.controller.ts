import { Controller, Get, HttpRedirectResponse, HttpStatus, Ip, NotFoundException, Param, Redirect, Req } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { OriginalUrlNotFoundException } from './error/original-url-not-found.error';
import { RedirectService } from './redirect.service';

@ApiTags('Redirect')
@Controller()
export class RedirectController {
	constructor(private readonly redirectService: RedirectService) {}

	@Get(':shortCode')
	@Redirect()
	@ApiOperation({ summary: 'Redirect to the original URL using a short code' })
	@ApiParam({
		name: 'shortCode',
		type: String,
		description: 'The short code that identifies the original URL',
		example: 'aB3xZ9',
	})
	@ApiResponse({
		status: HttpStatus.FOUND,
		description: 'Redirects to the original URL associated with the short code.',
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'No URL found for the given short code.',
	})
	public async redirect(@Param('shortCode') shortCode: string, @Ip() ip: string, @Req() request: Request): Promise<HttpRedirectResponse> {
		try {
			const url = await this.redirectService.resolveAcess(shortCode, ip, request.header('user-agent') ?? '');
			return { url, statusCode: HttpStatus.FOUND };
		} catch (error) {
			if (error instanceof OriginalUrlNotFoundException) {
				throw new NotFoundException();
			}
			throw error;
		}
	}
}
