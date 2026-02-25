import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResolveShortUrlPipe } from 'src/shorten/pipes/resolve-short-url.pipe';
import { ShortenUrl } from 'src/shorten/shorten.entity';
import { BrowserMetricsResponseDto } from './dto/browser-metrics-response.dto';
import { CityMetricsResponseDto } from './dto/city-metrics-response.dto';
import { ClicksMetricsResponseDto } from './dto/clicks-metrics-response.dto';
import { CountryMetricsResponseDto } from './dto/country-metrics-response.dto';
import { DeviceModelMetricsResponseDto } from './dto/device-model-metrics-response.dto';
import { DeviceVendorMetricsResponseDto } from './dto/device-vendor-metrics-response.dto';
import { MetricsSummaryResponseDto } from './dto/metrics-summary-response.dto';
import { OsMetricsResponseDto } from './dto/os-metrics-response.dto';
import { MetricsService } from './metrics.service';

@ApiTags('Metrics')
@ApiParam({ name: 'shortCode', description: 'The short code that identifies the URL' })
@Controller('metrics/:shortCode')
export class MetricsController {
	constructor(private readonly metricsService: MetricsService) {}

	@Get()
	@ApiOperation({ summary: 'Get a full metrics summary for a short URL' })
	@ApiResponse({ status: HttpStatus.OK, type: MetricsSummaryResponseDto })
	public getMetricsSummary(@Param('shortCode', ResolveShortUrlPipe) shortUrl: ShortenUrl) {
		return this.metricsService.getMetricsSummary(shortUrl.shortUrlId);
	}

	@Get('cities')
	@ApiOperation({ summary: 'Get click counts per city' })
	@ApiResponse({ status: HttpStatus.OK, type: [CityMetricsResponseDto] })
	public getCityMetrics(@Param('shortCode', ResolveShortUrlPipe) shortUrl: ShortenUrl) {
		return this.metricsService.getCityMetrics(shortUrl.shortUrlId);
	}

	@Get('countries')
	@ApiOperation({ summary: 'Get click counts per country' })
	@ApiResponse({ status: HttpStatus.OK, type: [CountryMetricsResponseDto] })
	public getCountryMetrics(@Param('shortCode', ResolveShortUrlPipe) shortUrl: ShortenUrl) {
		return this.metricsService.getCountryMetrics(shortUrl.shortUrlId);
	}

	@Get('device-models')
	@ApiOperation({ summary: 'Get click counts per device model and vendor' })
	@ApiResponse({ status: HttpStatus.OK, type: [DeviceModelMetricsResponseDto] })
	public getDeviceMetrics(@Param('shortCode', ResolveShortUrlPipe) shortUrl: ShortenUrl) {
		return this.metricsService.getDeviceModelMetrics(shortUrl.shortUrlId);
	}

	@Get('device-vendors')
	@ApiOperation({ summary: 'Get click counts per device vendor' })
	@ApiResponse({ status: HttpStatus.OK, type: [DeviceVendorMetricsResponseDto] })
	public getVendorsMetrics(@Param('shortCode', ResolveShortUrlPipe) shortUrl: ShortenUrl) {
		return this.metricsService.getDeviceVendorMetrics(shortUrl.shortUrlId);
	}

	@Get('browsers')
	@ApiOperation({ summary: 'Get click counts per browser' })
	@ApiResponse({ status: HttpStatus.OK, type: [BrowserMetricsResponseDto] })
	public getBrowserMetrics(@Param('shortCode', ResolveShortUrlPipe) shortUrl: ShortenUrl) {
		return this.metricsService.getBrowserMetrics(shortUrl.shortUrlId);
	}

	@Get('os')
	@ApiOperation({ summary: 'Get click counts per operating system and version' })
	@ApiResponse({ status: HttpStatus.OK, type: [OsMetricsResponseDto] })
	public getOsMetrics(@Param('shortCode', ResolveShortUrlPipe) shortUrl: ShortenUrl) {
		return this.metricsService.getOsMetrics(shortUrl.shortUrlId);
	}

	@Get('clicks')
	@ApiOperation({ summary: 'Get the total click count for a short URL' })
	@ApiResponse({ status: HttpStatus.OK, type: ClicksMetricsResponseDto })
	public getClicksMetrics(@Param('shortCode', ResolveShortUrlPipe) shortUrl: ShortenUrl) {
		return this.metricsService.getClicksMetrics(shortUrl.shortUrlId);
	}
}
