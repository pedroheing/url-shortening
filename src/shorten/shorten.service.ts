import { Injectable } from '@nestjs/common';
import { short_urls } from 'generated/prisma/client';
import { EncondingService } from 'src/core/enconding/enconding.service';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { SequenceService } from './sequence.service';
import { ShortenCacheService } from './shorten-cache.service';
import { ShortenConfigService } from './shorten-config.service';

export interface ShortenResponse {
	id: number;
	url: string;
	short_code: string;
	access_count: number;
	externalUrl: string;
}

@Injectable()
export class ShortenService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly sequenceService: SequenceService,
		private readonly shortenConfigService: ShortenConfigService,
		private readonly encondingService: EncondingService,
		private readonly shortenCacheService: ShortenCacheService,
	) {}

	public async shorten(url: string): Promise<ShortenResponse> {
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

	public async find(id: number): Promise<ShortenResponse | null> {
		const record = await this.prismaService.short_urls.findUnique({
			where: {
				id: id,
			},
		});
		if (!record) return null;
		return this.buildResponse(record);
	}

	public async findByShortCode(shortCode: string) {
		return await this.prismaService.short_urls.findUnique({
			where: {
				short_code: shortCode,
			},
		});
	}

	public async update(id: number, url: string): Promise<ShortenResponse> {
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

	public async delete(id: number): Promise<ShortenResponse> {
		const record = await this.prismaService.short_urls.delete({
			where: {
				id: id,
			},
		});
		await this.shortenCacheService.invalidate(record.short_code);
		return this.buildResponse(record);
	}

	// To create the short code we use a unique number converted to base62
	// It is used base62 insted of base64 due to the latter having unsafe url characters
	private async getNextShortCode(): Promise<string> {
		const nextValue = await this.sequenceService.getNextValue();
		return this.encondingService.encondeBase62(nextValue.toString());
	}

	private buildResponse(record: short_urls): ShortenResponse {
		return {
			id: record.id,
			url: record.url,
			short_code: record.short_code,
			access_count: record.access_count,
			externalUrl: this.buildExternalUrl(record.short_code),
		};
	}

	public buildExternalUrl(shortCode: string): string {
		return `${this.shortenConfigService.externalUrl}/${shortCode}`;
	}
}
