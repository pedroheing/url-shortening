import { ApiProperty } from '@nestjs/swagger';

export class ClicksMetricsResponseDto {
	@ApiProperty({
		description: 'Total number of clicks for this short URL',
		example: 12400,
	})
	readonly totalClicks!: number;
}
