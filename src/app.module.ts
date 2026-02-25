import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { MetricsModule } from './metrics/metrics.module';
import { RedirectModule } from './redirect/redirect.module';
import { ShortenModule } from './shorten/shorten.module';

@Module({
	imports: [ConfigModule.forRoot(), ScheduleModule.forRoot(), ShortenModule, RedirectModule, MetricsModule],
})
export class AppModule {}
