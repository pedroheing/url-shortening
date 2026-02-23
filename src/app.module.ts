import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedirectModule } from './redirect/redirect.module';
import { ShortenModule } from './shorten/shorten.module';

@Module({
	imports: [ConfigModule.forRoot(), ShortenModule, RedirectModule],
})
export class AppModule {}
