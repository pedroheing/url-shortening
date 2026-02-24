export abstract class GeolocationService {
	abstract lookupIp(ip: string): GeoInfo | null;
}

export interface GeoInfo {
	contry: string;
	region: string;
	timezone: string;
	city: string;
}
