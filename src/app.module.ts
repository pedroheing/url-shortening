import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { RedirectModule } from './redirect/redirect.module';
import { ShortenModule } from './shorten/shorten.module';

@Module({
	imports: [ConfigModule.forRoot(), ScheduleModule.forRoot(), ShortenModule, RedirectModule],
})
export class AppModule {}
