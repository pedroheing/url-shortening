import { Injectable } from '@nestjs/common';
import * as geoipLite from 'geoip-lite';
import { GeoInfo, GeolocationService } from '../geolocation.interface';

@Injectable()
export class GeoipLite implements GeolocationService {
	lookupIp(ip: string): GeoInfo | null {
		const geo = geoipLite.lookup(ip);
		if (!geo) {
			return null;
		}
		return {
			contry: geo.country,
			region: geo.region,
			timezone: geo.timezone,
			city: geo.city,
		};
	}
}
