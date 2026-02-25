import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'generated/prisma/client';
import { PrismaConfigService } from './prisma-config.service';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
	constructor(readonly prismaConfigService: PrismaConfigService) {
		super({
			adapter: new PrismaPg({
				connectionString: prismaConfigService.databaseUrl,
			}),
		});
	}

	onModuleInit() {
		return this.$connect();
	}

	onModuleDestroy() {
		return this.$disconnect();
	}
}
