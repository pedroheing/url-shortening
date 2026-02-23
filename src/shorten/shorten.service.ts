import { Injectable } from '@nestjs/common';
import { short_urls } from 'generated/prisma/client';
import { EncondingService } from 'src/core/enconding/enconding.service';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { ShortenResponseDto } from './dto/shorten-response.dto';
import { SequenceService } from './services/sequence.service';
import { ShortenCacheService } from './services/shorten-cache.service';
import { ShortenConfigService } from './services/shorten-config.service';

@Injectable()
export class ShortenService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly sequenceService: SequenceService,
		private readonly shortenConfigService: ShortenConfigService,
		private readonly encondingService: EncondingService,
		private readonly shortenCacheService: ShortenCacheService,
	) {}

	public async shorten(url: string): Promise<ShortenResponseDto> {
		const shortCode = await this.getNextShortCode();
		const record = await this.prismaService.short_urls.create({
			data: {
				short_code: shortCode,
				url: url,
			},
		});
		await this.shortenCacheService.set(shortCode, url);
		return this.buildResponse(record);
	}

	// to create the short code, we use a unique number converted to base62
	// it is used base62 instead of base64 due to the latter having unsafe URL characters
	private async getNextShortCode(): Promise<string> {
		const nextValue = await this.sequenceService.getNextValue();
		return this.encondingService.encondeBase62(nextValue.toString());
	}

	public async find(id: number): Promise<ShortenResponseDto | null> {
		const record = await this.prismaService.short_urls.findUnique({
			where: {
				id: id,
			},
		});
		if (!record) return null;
		return this.buildResponse(record);
	}

	public async findByShortCode(shortCode: string): Promise<short_urls | null> {
		return await this.prismaService.short_urls.findUnique({
			where: {
				short_code: shortCode,
			},
		});
	}

	public async update(id: number, url: string): Promise<ShortenResponseDto> {
		const record = await this.prismaService.short_urls.update({
			where: {
				id: id,
			},
			data: {
				url: url,
			},
		});
		await this.shortenCacheService.set(record.short_code, url);
		return this.buildResponse(record);
	}

	public async delete(id: number): Promise<ShortenResponseDto> {
		const record = await this.prismaService.short_urls.delete({
			where: {
				id: id,
			},
		});
		await this.shortenCacheService.invalidate(record.short_code);
		return this.buildResponse(record);
	}

	private buildResponse(record: short_urls): ShortenResponseDto {
		return {
			id: record.id,
			url: record.url,
			short_code: record.short_code,
			short_url: this.buildShortUrl(record.short_code),
			access_count: record.access_count,
		};
	}

	public buildShortUrl(shortCode: string): string {
		return `${this.shortenConfigService.shortUrlBase}/${shortCode}`;
	}
}
