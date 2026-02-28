import { Injectable } from '@nestjs/common';
import { short_urls } from 'generated/prisma/client';
import { EncondingService } from 'src/core/enconding/enconding.service';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { SequenceService } from './services/sequence.service';
import { ShortenCacheService } from './services/shorten-cache.service';
import { ShortenConfigService } from './services/shorten-config.service';
import { ShortenUrl } from './shorten.entity';

@Injectable()
export class ShortenService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly sequenceService: SequenceService,
		private readonly shortenConfigService: ShortenConfigService,
		private readonly encondingService: EncondingService,
		private readonly shortenCacheService: ShortenCacheService,
	) {}

	public async shorten(url: string): Promise<ShortenUrl> {
		const shortCode = await this.getNextShortCode();
		const record = await this.prismaService.short_urls.create({
			data: {
				short_code: shortCode,
				url: url,
			},
		});
		await this.shortenCacheService.set(shortCode, {
			shortUrlId: record.short_url_id,
			url: record.url,
		});
		return this.buildResponse(record);
	}

	// to create the short code, we use a unique number converted to base62
	// base62 is used instead of base64 because the latter contains unsafe URL characters
	private async getNextShortCode(): Promise<string> {
		const nextValue = await this.sequenceService.getNextValue();
		return this.encondingService.encondeBase62(nextValue.toString());
	}

	public async findByShortCode(shortCode: string): Promise<ShortenUrl | null> {
		const record = await this.prismaService.short_urls.findUnique({
			where: {
				short_code: shortCode,
			},
		});
		if (!record) return null;
		return this.buildResponse(record);
	}

	public async updateByShortCode(shortCode: string, url: string): Promise<ShortenUrl> {
		const record = await this.prismaService.short_urls.update({
			where: {
				short_code: shortCode,
			},
			data: {
				url: url,
			},
		});
		await this.shortenCacheService.set(shortCode, {
			url: url,
			shortUrlId: record.short_url_id,
		});
		return this.buildResponse(record);
	}

	public async deleteByShortCode(shortCode: string): Promise<ShortenUrl> {
		const record = await this.prismaService.short_urls.delete({
			where: {
				short_code: shortCode,
			},
		});
		await this.shortenCacheService.invalidate(shortCode);
		return this.buildResponse(record);
	}

	private buildResponse(record: short_urls): ShortenUrl {
		return {
			shortUrlId: record.short_url_id,
			shortCode: record.short_code,
			url: record.url,
			shortUrl: this.buildShortUrl(record.short_code),
		};
	}

	public buildShortUrl(shortCode: string): string {
		return `${this.shortenConfigService.shortUrlBase}/${shortCode}`;
	}
}
