import { Injectable } from '@nestjs/common';
import { IsNotEmpty, IsNumber, IsString, Min, MinLength } from 'class-validator';

export class ShortenEnv {
	@IsNotEmpty()
	@IsString()
	@MinLength(1)
	readonly EXTERNAL_URL!: string;

	@IsNotEmpty()
	@IsNumber()
	@Min(1)
	readonly SHORT_URL_CACHE_TTL_SECONDS!: number;
}

@Injectable()
export class ShortenConfigService {
	public readonly externalUrl: string;
	public readonly shortUrlCacheTTLSeconds: number;

	constructor(config: ShortenEnv) {
		this.externalUrl = config.EXTERNAL_URL;
		this.shortUrlCacheTTLSeconds = config.SHORT_URL_CACHE_TTL_SECONDS;
	}
}
