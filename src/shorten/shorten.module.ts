import { Module } from '@nestjs/common';
import { CacheModule } from 'src/core/cache/cache.module';
import { createEnvProvider } from 'src/core/config/config-factory';
import { EncondingModule } from 'src/core/enconding/enconding.module';
import { PrismaModule } from 'src/core/prisma/prisma.module';
import { ResolveShortUrlPipe } from './pipes/resolve-short-url.pipe';
import { SequenceService } from './services/sequence.service';
import { ShortenCacheService } from './services/shorten-cache.service';
import { ShortenConfigService, ShortenEnv } from './services/shorten-config.service';
import { ShortenController } from './shorten.controller';
import { ShortenService } from './shorten.service';

@Module({
	imports: [PrismaModule, EncondingModule, CacheModule],
	controllers: [ShortenController],
	providers: [ShortenService, ShortenCacheService, SequenceService, ShortenConfigService, createEnvProvider(ShortenEnv), ResolveShortUrlPipe],
	exports: [ShortenService, ShortenCacheService, ResolveShortUrlPipe],
})
export class ShortenModule {}
