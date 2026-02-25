import { Module } from '@nestjs/common';
import { GeolocationModule } from 'src/core/geolocation/geolocation.module';
import { MetricsModule } from 'src/metrics/metrics.module';
import { ShortenModule } from 'src/shorten/shorten.module';
import { RedirectController } from './redirect.controller';
import { RedirectService } from './redirect.service';

@Module({
	imports: [ShortenModule, MetricsModule, GeolocationModule],
	controllers: [RedirectController],
	providers: [RedirectService],
})
export class RedirectModule {}
