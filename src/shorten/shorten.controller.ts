import { Body, Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Param, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Prisma } from 'generated/prisma/client';
import { ShortenResponseDto } from './dto/shorten-response.dto';
import { ShortenDto } from './dto/shorten.dto';
import { UpdateOriginalUrlDto } from './dto/update-original-url.dto';
import { ShortenUrl } from './shorten.entity';
import { ShortenService } from './shorten.service';

@ApiTags('Shorten')
@Controller('shorten')
export class ShortenController {
	constructor(private readonly shortenService: ShortenService) {}

	@Post()
	@ApiOperation({ summary: 'Create a shortened URL' })
	@ApiBody({ type: ShortenDto })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'The URL was successfully shortened.',
		type: ShortenResponseDto,
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: 'Invalid request body. The "url" field is required and must be a string.',
	})
	public async shorten(@Body() dto: ShortenDto): Promise<ShortenResponseDto> {
		return this.mapToDto(await this.shortenService.shorten(dto.url));
	}

	@Get(':shortCode')
	@ApiOperation({ summary: 'Get a shortened URL by short code' })
	@ApiParam({ name: 'shortCode', description: 'The short code that identifies the URL', example: 'aB3xZ9' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'The shortened URL record.',
		type: ShortenResponseDto,
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'No shortened URL found with the given short code.',
	})
	public async find(@Param('shortCode') shortCode: string): Promise<ShortenResponseDto> {
		const shortenUrl = await this.shortenService.findByShortCode(shortCode);
		if (!shortenUrl) {
			throw new NotFoundException();
		}
		return this.mapToDto(shortenUrl);
	}

	@Patch(':shortCode')
	@ApiOperation({ summary: 'Update the original URL of a shortened link' })
	@ApiParam({ name: 'shortCode', description: 'The short code that identifies the URL', example: 'aB3xZ9' })
	@ApiBody({ type: UpdateOriginalUrlDto })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'The original URL was successfully updated.',
		type: ShortenResponseDto,
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'No shortened URL found with the given short code.',
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: 'Invalid request body.',
	})
	public async update(@Param('shortCode') shortCode: string, @Body() dto: UpdateOriginalUrlDto): Promise<ShortenResponseDto> {
		try {
			return this.mapToDto(await this.shortenService.updateByShortCode(shortCode, dto.url));
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
				throw new NotFoundException();
			}
			throw error;
		}
	}

	@Delete(':shortCode')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: 'Delete a shortened URL' })
	@ApiParam({ name: 'shortCode', description: 'The short code that identifies the URL', example: 'aB3xZ9' })
	@ApiResponse({
		status: HttpStatus.NO_CONTENT,
		description: 'The shortened URL was successfully deleted.',
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'No shortened URL found with the given short code.',
	})
	public async delete(@Param('shortCode') shortCode: string): Promise<void> {
		try {
			await this.shortenService.deleteByShortCode(shortCode);
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
				throw new NotFoundException();
			}
			throw error;
		}
	}

	private mapToDto(shortenUrl: ShortenUrl): ShortenResponseDto {
		return {
			url: shortenUrl.url,
			shortCode: shortenUrl.shortCode,
			shortUrl: shortenUrl.shortUrl,
		};
	}
}
