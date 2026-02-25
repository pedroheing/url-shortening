import { ApiProperty } from '@nestjs/swagger';
import { BrowserMetricsResponseDto } from './browser-metrics-response.dto';
import { CityMetricsResponseDto } from './city-metrics-response.dto';
import { ClicksMetricsResponseDto } from './clicks-metrics-response.dto';
import { CountryMetricsResponseDto } from './country-metrics-response.dto';
import { DeviceModelMetricsResponseDto } from './device-model-metrics-response.dto';
import { DeviceVendorMetricsResponseDto } from './device-vendor-metrics-response.dto';
import { OsMetricsResponseDto } from './os-metrics-response.dto';

export class MetricsSummaryResponseDto {
	@ApiProperty({ type: [CityMetricsResponseDto] })
	readonly city!: CityMetricsResponseDto[];

	@ApiProperty({ type: [CountryMetricsResponseDto] })
	readonly country!: CountryMetricsResponseDto[];

	@ApiProperty({ type: [DeviceModelMetricsResponseDto] })
	readonly deviceModel!: DeviceModelMetricsResponseDto[];

	@ApiProperty({ type: [DeviceVendorMetricsResponseDto] })
	readonly deviceVendor!: DeviceVendorMetricsResponseDto[];

	@ApiProperty({ type: [BrowserMetricsResponseDto] })
	readonly browser!: BrowserMetricsResponseDto[];

	@ApiProperty({ type: [OsMetricsResponseDto] })
	readonly os!: OsMetricsResponseDto[];

	@ApiProperty({ type: ClicksMetricsResponseDto })
	readonly clicks!: ClicksMetricsResponseDto;
}
