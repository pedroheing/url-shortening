import { ApiProperty } from '@nestjs/swagger';

export class OsMetricsResponseDto {
	@ApiProperty({
		description: 'Total number of clicks from this OS version',
		example: 2700,
	})
	readonly clicks!: number;

	@ApiProperty({
		description: 'Operating system name',
		example: 'iOS',
	})
	readonly os!: string | null;

	@ApiProperty({
		description: 'Operating system version',
		example: '17.4',
	})
	readonly osVersion!: string | null;
}
