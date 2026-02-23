import { ApiProperty } from '@nestjs/swagger';

export class ShortenResponseDto {
	@ApiProperty({
		description: 'The unique numeric identifier of the shortened URL',
		example: 1,
	})
	readonly id!: number;

	@ApiProperty({
		description: 'The original URL',
		example: 'https://www.example.com/some/very/long/path?with=query&params=here',
	})
	readonly url!: string;

	@ApiProperty({
		description: 'The short code used to identify this URL',
		example: 'aB3xZ9',
	})
	readonly short_code!: string;

	@ApiProperty({
		description: 'The full short URL ready to use',
		example: 'http://localhost:3000/aB3xZ9',
	})
	readonly short_url!: string;

	@ApiProperty({
		description: 'The number of times the short URL has been accessed',
		example: 1,
	})
	readonly access_count!: number;
}
