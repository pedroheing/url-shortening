import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { BrowserMetricsResponseDto } from './dto/browser-metrics-response.dto';
import { CityMetricsResponseDto } from './dto/city-metrics-response.dto';
import { ClicksMetricsResponseDto } from './dto/clicks-metrics-response.dto';
import { CountryMetricsResponseDto } from './dto/country-metrics-response.dto';
import { DeviceModelMetricsResponseDto } from './dto/device-model-metrics-response.dto';
import { DeviceVendorMetricsResponseDto } from './dto/device-vendor-metrics-response.dto';
import { MetricsSummaryResponseDto } from './dto/metrics-summary-response.dto';
import { OsMetricsResponseDto } from './dto/os-metrics-response.dto';

interface metricsInput {
	shortUrlId: number;
	groupBy: Prisma.ClicksScalarFieldEnum | Prisma.ClicksScalarFieldEnum[];
	orderBy: Prisma.ClicksScalarFieldEnum;
}

@Injectable()
export class MetricsService {
	constructor(private readonly prismaService: PrismaService) {}

	public async getMetricsSummary(shortUrlId: number): Promise<MetricsSummaryResponseDto> {
		const [cityMetrics, countryMetrics, deviceModelMetrics, deviceVendorMetrics, browserMetrics, osMetrics, clicksMetrics] = await Promise.all([
			this.getCityMetrics(shortUrlId),
			this.getCountryMetrics(shortUrlId),
			this.getDeviceModelMetrics(shortUrlId),
			this.getDeviceVendorMetrics(shortUrlId),
			this.getBrowserMetrics(shortUrlId),
			this.getOsMetrics(shortUrlId),
			this.getClicksMetrics(shortUrlId),
		]);
		return {
			city: cityMetrics,
			country: countryMetrics,
			deviceModel: deviceModelMetrics,
			deviceVendor: deviceVendorMetrics,
			browser: browserMetrics,
			os: osMetrics,
			clicks: clicksMetrics,
		};
	}

	public async getCityMetrics(shortUrlId: number): Promise<CityMetricsResponseDto[]> {
		const metrics = await this.getMetrics({
			shortUrlId,
			groupBy: Prisma.ClicksScalarFieldEnum.city,
			orderBy: Prisma.ClicksScalarFieldEnum.city,
		});
		return metrics.map((m) => {
			return {
				clicks: m._count,
				city: m.city,
			};
		});
	}

	public async getCountryMetrics(shortUrlId: number): Promise<CountryMetricsResponseDto[]> {
		const metrics = await this.getMetrics({
			shortUrlId,
			groupBy: Prisma.ClicksScalarFieldEnum.country,
			orderBy: Prisma.ClicksScalarFieldEnum.country,
		});
		return metrics.map((m) => {
			return {
				clicks: m._count,
				country: m.country,
			};
		});
	}

	public async getDeviceModelMetrics(shortUrlId: number): Promise<DeviceModelMetricsResponseDto[]> {
		const metrics = await this.getMetrics({
			shortUrlId,
			groupBy: [Prisma.ClicksScalarFieldEnum.device_model, Prisma.ClicksScalarFieldEnum.device_vendor],
			orderBy: Prisma.ClicksScalarFieldEnum.device_model,
		});
		return metrics.map((m) => {
			return {
				clicks: m._count,
				deviceModel: m.device_model,
				deviceVendor: m.device_vendor,
			};
		});
	}

	public async getDeviceVendorMetrics(shortUrlId: number): Promise<DeviceVendorMetricsResponseDto[]> {
		const metrics = await this.getMetrics({
			shortUrlId,
			groupBy: Prisma.ClicksScalarFieldEnum.device_vendor,
			orderBy: Prisma.ClicksScalarFieldEnum.device_vendor,
		});
		return metrics.map((m) => {
			return {
				clicks: m._count,
				deviceVendor: m.device_vendor,
			};
		});
	}

	public async getBrowserMetrics(shortUrlId: number): Promise<BrowserMetricsResponseDto[]> {
		const metrics = await this.getMetrics({
			shortUrlId,
			groupBy: Prisma.ClicksScalarFieldEnum.browser_name,
			orderBy: Prisma.ClicksScalarFieldEnum.browser_name,
		});
		return metrics.map((m) => {
			return {
				clicks: m._count,
				browserName: m.browser_name,
			};
		});
	}

	public async getOsMetrics(shortUrlId: number): Promise<OsMetricsResponseDto[]> {
		const metrics = await this.getMetrics({
			shortUrlId,
			groupBy: [Prisma.ClicksScalarFieldEnum.os, Prisma.ClicksScalarFieldEnum.os_version],
			orderBy: Prisma.ClicksScalarFieldEnum.os,
		});
		return metrics.map((m) => {
			return {
				clicks: m._count,
				os: m.os,
				osVersion: m.os_version,
			};
		});
	}

	public async getClicksMetrics(shortUrlId: number): Promise<ClicksMetricsResponseDto> {
		const clicksCount = await this.prismaService.clicks.count({
			where: {
				short_url_id: shortUrlId,
			},
		});
		return {
			totalClicks: clicksCount,
		};
	}

	private async getMetrics(input: metricsInput) {
		return await this.prismaService.clicks.groupBy({
			where: {
				short_url_id: input.shortUrlId,
			},
			by: input.groupBy,
			_count: true,
			orderBy: {
				_count: {
					[input.orderBy]: 'desc',
				},
			},
		});
	}
}
