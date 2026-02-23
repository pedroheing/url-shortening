import { Injectable } from '@nestjs/common';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class PrismaEnv {
	@IsNotEmpty()
	@IsString()
	@MinLength(1)
	readonly DATABASE_URL!: string;
}

@Injectable()
export class PrismaConfigService {
	public readonly databaseUrl: string;

	constructor(config: PrismaEnv) {
		this.databaseUrl = config.DATABASE_URL;
	}
}
