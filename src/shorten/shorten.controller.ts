import { Body, Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Prisma } from 'generated/prisma/client';
import { ShortenResponseDto } from './dto/shorten-response.dto';
import { ShortenDto } from './dto/shorten.dto';
import { UpdateOriginalUrlDto } from './dto/update-original-url.dto';
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
	public async shorten(@Body() dto: ShortenDto) {
		return await this.shortenService.shorten(dto.url);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get a shortened URL by ID' })
	@ApiParam({ name: 'id', type: Number, description: 'The numeric ID of the shortened URL', example: 1 })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'The shortened URL record.',
		type: ShortenResponseDto,
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'No shortened URL found with the given ID.',
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: 'The ID must be a valid integer.',
	})
	public async find(@Param('id', ParseIntPipe) id: number) {
		const shortenUrl = await this.shortenService.find(id);
		if (!shortenUrl) {
			throw new NotFoundException();
		}
		return shortenUrl;
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Update the original URL of a shortened link' })
	@ApiParam({ name: 'id', type: Number, description: 'The numeric ID of the shortened URL', example: 1 })
	@ApiBody({ type: UpdateOriginalUrlDto })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'The original URL was successfully updated.',
		type: ShortenResponseDto,
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'No shortened URL found with the given ID.',
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: 'Invalid request body or ID.',
	})
	public async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateOriginalUrlDto) {
		try {
			return await this.shortenService.update(id, dto.url);
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
				throw new NotFoundException();
			}
			throw error;
		}
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: 'Delete a shortened URL' })
	@ApiParam({ name: 'id', type: Number, description: 'The numeric ID of the shortened URL', example: 1 })
	@ApiResponse({
		status: HttpStatus.NO_CONTENT,
		description: 'The shortened URL was successfully deleted.',
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: 'No shortened URL found with the given ID.',
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: 'The ID must be a valid integer.',
	})
	public async delete(@Param('id', ParseIntPipe) id: number) {
		try {
			await this.shortenService.delete(id);
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
				throw new NotFoundException();
			}
			throw error;
		}
	}
}
