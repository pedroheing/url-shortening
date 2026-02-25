import { ApiProperty } from '@nestjs/swagger';

export class BrowserMetricsResponseDto {
	@ApiProperty({
		description: 'Total number of clicks from this browser',
		example: 5400,
	})
	readonly clicks!: number;

	@ApiProperty({
		description: 'Browser name',
		example: 'Chrome',
	})
	readonly browserName!: string | null;
}
