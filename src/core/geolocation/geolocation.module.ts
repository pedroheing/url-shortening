import { Module } from '@nestjs/common';
import { GeolocationService } from './geolocation.interface';
import { GeoipLite } from './providers/geoip-lite.service';

@Module({
	providers: [{ provide: GeolocationService, useClass: GeoipLite }],
	exports: [GeolocationService],
})
export class GeolocationModule {}
