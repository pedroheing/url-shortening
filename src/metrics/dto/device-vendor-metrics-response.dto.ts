import { ApiProperty } from '@nestjs/swagger';

export class DeviceVendorMetricsResponseDto {
	@ApiProperty({
		description: 'Total number of clicks from this device vendor',
		example: 3100,
	})
	readonly clicks!: number;

	@ApiProperty({
		description: 'Device vendor name',
		example: 'Samsung',
	})
	readonly deviceVendor!: string | null;
}
