import { Test } from '@nestjs/testing';
import { mock } from 'jest-mock-extended';
import { ResolveShortUrlPipe } from 'src/shorten/pipes/resolve-short-url.pipe';
import { ShortenService } from 'src/shorten/shorten.service';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';

describe('MetricsController', () => {
	let metricsController: MetricsController;
	const metricsService = mock<MetricsService>();
	const resolveShortUrlPipe = mock<ResolveShortUrlPipe>();
	const shortenService = mock<ShortenService>();

	const shortUrl = { shortUrlId: 1, shortCode: '', url: '', shortUrl: '' };

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [
				MetricsController,
				{ provide: MetricsService, useValue: metricsService },
				{ provide: ResolveShortUrlPipe, useValue: resolveShortUrlPipe },
				{ provide: ShortenService, useValue: shortenService },
			],
		}).compile();
		metricsController = module.get(MetricsController);
	});

	it('should be defined', () => {
		expect(metricsController).toBeDefined();
	});

	describe('getMetricsSummary', () => {
		it('should return the metrics summary', async () => {
			const result = 1;
			metricsService.getMetricsSummary.mockResolvedValue(result as any);

			const metricsSummary = await metricsController.getMetricsSummary(shortUrl);

			expect(metricsService.getMetricsSummary).toHaveBeenCalledWith(shortUrl.shortUrlId);
			expect(metricsSummary).toBe(result);
		});
	});

	describe('getCityMetrics', () => {
		it('should return the city metrics', async () => {
			const result = 1;
			metricsService.getCityMetrics.mockResolvedValue(result as any);

			const metricsSummary = await metricsController.getCityMetrics(shortUrl);

			expect(metricsService.getCityMetrics).toHaveBeenCalledWith(shortUrl.shortUrlId);
			expect(metricsSummary).toBe(result);
		});
	});

	describe('getCountryMetrics', () => {
		it('should return the country metrics', async () => {
			const result = 1;
			metricsService.getCountryMetrics.mockResolvedValue(result as any);

			const metricsSummary = await metricsController.getCountryMetrics(shortUrl);

			expect(metricsService.getCountryMetrics).toHaveBeenCalledWith(shortUrl.shortUrlId);
			expect(metricsSummary).toBe(result);
		});
	});

	describe('getDeviceMetrics', () => {
		it('should return the device metrics', async () => {
			const result = 1;
			metricsService.getDeviceModelMetrics.mockResolvedValue(result as any);

			const metricsSummary = await metricsController.getDeviceMetrics(shortUrl);

			expect(metricsService.getDeviceModelMetrics).toHaveBeenCalledWith(shortUrl.shortUrlId);
			expect(metricsSummary).toBe(result);
		});
	});

	describe('getVendorsMetrics', () => {
		it('should return the device vendor metrics', async () => {
			const result = 1;
			metricsService.getDeviceVendorMetrics.mockResolvedValue(result as any);

			const metricsSummary = await metricsController.getVendorsMetrics(shortUrl);

			expect(metricsService.getDeviceVendorMetrics).toHaveBeenCalledWith(shortUrl.shortUrlId);
			expect(metricsSummary).toBe(result);
		});
	});

	describe('getBrowserMetrics', () => {
		it('should return the browser metrics', async () => {
			const result = 1;
			metricsService.getBrowserMetrics.mockResolvedValue(result as any);

			const metricsSummary = await metricsController.getBrowserMetrics(shortUrl);

			expect(metricsService.getBrowserMetrics).toHaveBeenCalledWith(shortUrl.shortUrlId);
			expect(metricsSummary).toBe(result);
		});
	});

	describe('getOsMetrics', () => {
		it('should return the os metrics', async () => {
			const result = 1;
			metricsService.getOsMetrics.mockResolvedValue(result as any);

			const metricsSummary = await metricsController.getOsMetrics(shortUrl);

			expect(metricsService.getOsMetrics).toHaveBeenCalledWith(shortUrl.shortUrlId);
			expect(metricsSummary).toBe(result);
		});
	});

	describe('getClicksMetrics', () => {
		it('should return the clicks metrics', async () => {
			const result = 1;
			metricsService.getClicksMetrics.mockResolvedValue(result as any);

			const metricsSummary = await metricsController.getClicksMetrics(shortUrl);

			expect(metricsService.getClicksMetrics).toHaveBeenCalledWith(shortUrl.shortUrlId);
			expect(metricsSummary).toBe(result);
		});
	});
});
