import { Module } from '@nestjs/common';
import { AnalyticsModule } from 'src/analytics/analytics.module';
import { GeolocationModule } from 'src/core/geolocation/geolocation.module';
import { ShortenModule } from 'src/shorten/shorten.module';
import { RedirectController } from './redirect.controller';
import { RedirectService } from './redirect.service';

@Module({
	imports: [ShortenModule, AnalyticsModule, GeolocationModule],
	controllers: [RedirectController],
	providers: [RedirectService],
})
export class RedirectModule {}
