export abstract class GeolocationService {
	abstract lookupIp(ip: string): GeoInfo | null;
}

export interface GeoInfo {
	country: string;
	region: string;
	timezone: string;
	city: string;
}
