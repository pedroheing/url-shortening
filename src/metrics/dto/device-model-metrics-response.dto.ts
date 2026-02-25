import { ApiProperty } from '@nestjs/swagger';

export class DeviceModelMetricsResponseDto {
	@ApiProperty({
		description: 'Total number of clicks from this device model',
		example: 620,
	})
	readonly clicks!: number;

	@ApiProperty({
		description: 'Device model name',
		example: 'iPhone 15 Pro',
	})
	readonly deviceModel!: string | null;

	@ApiProperty({
		description: 'Device vendor name',
		example: 'Apple',
	})
	readonly deviceVendor!: string | null;
}
