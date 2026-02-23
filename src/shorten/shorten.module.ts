import { Module } from '@nestjs/common';
import { createEnvProvider } from 'src/config/config-factory';
import { CacheModule } from 'src/core/cache/cache.module';
import { EncondingModule } from 'src/core/enconding/enconding.module';
import { PrismaModule } from 'src/core/prisma/prisma.module';
import { SequenceService } from './sequence.service';
import { ShortenCacheService } from './shorten-cache.service';
import { ShortenConfigService, ShortenEnv } from './shorten-config.service';
import { ShortenController } from './shorten.controller';
import { ShortenService } from './shorten.service';

@Module({
	imports: [PrismaModule, EncondingModule, CacheModule],
	controllers: [ShortenController],
	providers: [ShortenService, ShortenCacheService, SequenceService, ShortenConfigService, createEnvProvider(ShortenEnv)],
	exports: [ShortenService, ShortenCacheService],
})
export class ShortenModule {}
