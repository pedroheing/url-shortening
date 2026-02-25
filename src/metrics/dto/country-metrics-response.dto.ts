import { ApiProperty } from '@nestjs/swagger';

export class CountryMetricsResponseDto {
	@ApiProperty({
		description: 'Total number of clicks from this country',
		example: 8300,
	})
	readonly clicks!: number;

	@ApiProperty({
		description: 'Country name',
		example: 'Brazil',
	})
	readonly country!: string | null;
}
