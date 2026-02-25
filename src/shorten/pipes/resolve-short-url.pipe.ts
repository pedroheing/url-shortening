import { Injectable, NotFoundException, PipeTransform } from '@nestjs/common';
import { short_urls } from 'generated/prisma/browser';
import { ShortenService } from 'src/shorten/shorten.service';

@Injectable()
export class ResolveShortUrlPipe implements PipeTransform {
	constructor(private readonly shorten: ShortenService) {}

	async transform(shortCode: string): Promise<short_urls> {
		const shortUrl = await this.shorten.findByShortCode(shortCode);
		if (!shortUrl) throw new NotFoundException(`Short URL '${shortCode}' was not found`);
		return shortUrl;
	}
}
