import { UserAgentResult } from 'src/common/decorators/user-agent.decorator';
import { GeoInfo } from 'src/core/geolocation/geolocation.interface';

export const CLICKS_QUEUE_KEY = 'metrics:clicks';

export interface RegisterClickData {
	shortUrlId: number;
	ip: string;
	geo: GeoInfo | null;
	userAgent: UserAgentResult;
}
