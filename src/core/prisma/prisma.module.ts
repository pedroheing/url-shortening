import { Module } from '@nestjs/common';
import { createEnvProvider } from 'src/core/config/config-factory';
import { PrismaConfigService, PrismaEnv } from './prisma-config.service';
import { PrismaService } from './prisma.service';

@Module({
	providers: [PrismaService, PrismaConfigService, createEnvProvider(PrismaEnv)],
	exports: [PrismaService],
})
export class PrismaModule {}
