import { Test } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { MetricsService } from './metrics.service';

describe('MetricsService', () => {
	let metricsService: MetricsService;
	const prismaService = mockDeep<PrismaService>();

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [MetricsService, { provide: PrismaService, useValue: prismaService }],
		}).compile();
		metricsService = module.get(MetricsService);
	});

	it('should be defined', () => {
		expect(metricsService).toBeDefined();
	});

	describe('getMetricsSummary', () => {
		it('should return the all the metrics', async () => {
			const grouByDbResult = [];
			const countDbResult = 100;
			const result = {
				city: grouByDbResult,
				country: grouByDbResult,
				deviceModel: grouByDbResult,
				deviceVendor: grouByDbResult,
				browser: grouByDbResult,
				os: grouByDbResult,
				clicks: {
					totalClicks: countDbResult,
				},
			};
			const id = 1;
			prismaService.clicks.groupBy.mockResolvedValue(grouByDbResult);
			prismaService.clicks.count.mockResolvedValue(countDbResult);

			const cityMetrics = await metricsService.getMetricsSummary(id);

			expect(cityMetrics).toEqual(result);
		});
	});

	describe('getCityMetrics', () => {
		it('should return the city metrics', async () => {
			const dbResult = [
				{
					_count: 10,
					city: 'São Paulo',
				},
				{
					_count: 11,
					city: 'Rio de Janeiro',
				},
			];
			const result = dbResult.map((r) => {
				return {
					clicks: r._count,
					city: r.city,
				};
			});
			const id = 1;
			prismaService.clicks.groupBy.mockResolvedValue(dbResult as any);

			const cityMetrics = await metricsService.getCityMetrics(id);

			expect(prismaService.clicks.groupBy).toHaveBeenCalledWith(expect.objectContaining({ where: { short_url_id: id } }));
			expect(cityMetrics).toEqual(result);
		});
	});

	describe('getCountryMetrics', () => {
		it('should return the country metrics', async () => {
			const dbResult = [
				{
					_count: 2000,
					country: 'Brazil',
				},
				{
					_count: 3400,
					country: 'USA',
				},
			];
			const result = dbResult.map((r) => {
				return {
					clicks: r._count,
					country: r.country,
				};
			});
			const id = 1;
			prismaService.clicks.groupBy.mockResolvedValue(dbResult as any);

			const countryMetrics = await metricsService.getCountryMetrics(id);

			expect(prismaService.clicks.groupBy).toHaveBeenCalledWith(expect.objectContaining({ where: { short_url_id: id } }));
			expect(countryMetrics).toEqual(result);
		});
	});

	describe('getDeviceModelMetrics', () => {
		it('should return the device model metrics', async () => {
			const dbResult = [
				{
					_count: 10,
					device_model: 'XYZ-A',
					device_vendor: 'AAA',
				},
				{
					_count: 11,
					device_model: 'ABC-X',
					device_vendor: 'BBB',
				},
			];
			const result = dbResult.map((r) => {
				return {
					clicks: r._count,
					deviceModel: r.device_model,
					deviceVendor: r.device_vendor,
				};
			});
			const id = 1;
			prismaService.clicks.groupBy.mockResolvedValue(dbResult as any);

			const deviceModelMetrics = await metricsService.getDeviceModelMetrics(id);

			expect(prismaService.clicks.groupBy).toHaveBeenCalledWith(expect.objectContaining({ where: { short_url_id: id } }));
			expect(deviceModelMetrics).toEqual(result);
		});
	});

	describe('getDeviceVendorMetrics', () => {
		it('should return the device vendor metrics', async () => {
			const dbResult = [
				{
					_count: 120,
					device_vendor: 'AAA',
				},
				{
					_count: 10,
					device_vendor: 'BBB',
				},
			];
			const result = dbResult.map((r) => {
				return {
					clicks: r._count,
					deviceVendor: r.device_vendor,
				};
			});
			const id = 1;
			prismaService.clicks.groupBy.mockResolvedValue(dbResult as any);

			const deviceVendorMetrics = await metricsService.getDeviceVendorMetrics(id);

			expect(prismaService.clicks.groupBy).toHaveBeenCalledWith(expect.objectContaining({ where: { short_url_id: id } }));
			expect(deviceVendorMetrics).toEqual(result);
		});
	});

	describe('getBrowserMetrics', () => {
		it('should return the browser metrics', async () => {
			const dbResult = [
				{
					_count: 100,
					browser_name: 'Chrome',
				},
				{
					_count: 90,
					browser_name: 'Firefox',
				},
			];
			const result = dbResult.map((r) => {
				return {
					clicks: r._count,
					browserName: r.browser_name,
				};
			});
			const id = 1;
			prismaService.clicks.groupBy.mockResolvedValue(dbResult as any);

			const browserMetrics = await metricsService.getBrowserMetrics(id);

			expect(prismaService.clicks.groupBy).toHaveBeenCalledWith(expect.objectContaining({ where: { short_url_id: id } }));
			expect(browserMetrics).toEqual(result);
		});
	});

	describe('getOsMetrics', () => {
		it('should return the os metrics', async () => {
			const dbResult = [
				{
					_count: 100,
					os: 'Windows',
					os_version: '11',
				},
				{
					_count: 90,
					os: 'Linux',
					os_version: '22.4',
				},
			];
			const result = dbResult.map((r) => {
				return {
					clicks: r._count,
					os: r.os,
					osVersion: r.os_version,
				};
			});
			const id = 1;
			prismaService.clicks.groupBy.mockResolvedValue(dbResult as any);

			const osMetrics = await metricsService.getOsMetrics(id);

			expect(prismaService.clicks.groupBy).toHaveBeenCalledWith(expect.objectContaining({ where: { short_url_id: id } }));
			expect(osMetrics).toEqual(result);
		});
	});

	describe('getClicksMetrics', () => {
		it('should return the click metrics', async () => {
			const dbResult = 100;
			const result = {
				totalClicks: dbResult,
			};
			const id = 1;
			prismaService.clicks.count.mockResolvedValue(dbResult);

			const clickMetrics = await metricsService.getClicksMetrics(id);

			expect(prismaService.clicks.count).toHaveBeenCalledWith(expect.objectContaining({ where: { short_url_id: id } }));
			expect(clickMetrics).toEqual(result);
		});
	});
});
