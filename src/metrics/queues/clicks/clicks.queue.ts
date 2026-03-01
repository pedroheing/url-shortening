export const CLICKS_QUEUE_KEY = 'metrics:clicks';

export interface RegisterClickData {
	shortUrlId: number;
	ip: string;
	userAgent: string;
}
