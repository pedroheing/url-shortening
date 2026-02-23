import { Injectable } from '@nestjs/common';
import { IsNotEmpty, IsNumber, IsString, Min, MinLength } from 'class-validator';

export class ShortenEnv {
	@IsNotEmpty()
	@IsString()
	@MinLength(1)
	readonly SHORT_URL_BASE!: string;

	@IsNotEmpty()
	@IsNumber()
	@Min(1)
	readonly SHORT_URL_CACHE_TTL_SECONDS!: number;
}

@Injectable()
export class ShortenConfigService {
	public readonly shortUrlBase: string;
	public readonly shortUrlCacheTTLSeconds: number;

	constructor(config: ShortenEnv) {
		this.shortUrlBase = config.SHORT_URL_BASE;
		this.shortUrlCacheTTLSeconds = config.SHORT_URL_CACHE_TTL_SECONDS;
	}
}
