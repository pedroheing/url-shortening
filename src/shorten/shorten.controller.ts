import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	NotFoundException,
	Param,
	ParseIntPipe,
	Patch,
	Post,
} from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { ShortenDto } from './dto/shorten.dto';
import { UpdateOriginalUrlDto } from './dto/update-original-url.dto';
import { ShortenService } from './shorten.service';

@Controller('shorten')
export class ShortenController {
	constructor(private readonly shortenService: ShortenService) {}

	@Post()
	public async shorten(@Body() dto: ShortenDto) {
		return await this.shortenService.shorten(dto.url);
	}

	@Get(':id')
	public async find(@Param('id', ParseIntPipe) id: number) {
		const shortenUrl = await this.shortenService.find(id);
		if (!shortenUrl) {
			throw new NotFoundException();
		}
		return shortenUrl;
	}

	@Patch(':id')
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
