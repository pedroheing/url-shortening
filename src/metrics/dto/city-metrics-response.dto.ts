import { ApiProperty } from '@nestjs/swagger';

export class CityMetricsResponseDto {
	@ApiProperty({
		description: 'Total number of clicks from this city',
		example: 1500,
	})
	readonly clicks!: number;

	@ApiProperty({
		description: 'City name',
		example: 'New York',
	})
	readonly city!: string | null;
}
