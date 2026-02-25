import { ApiProperty } from '@nestjs/swagger';

export class ShortenResponseDto {
	@ApiProperty({
		description: 'The original URL',
		example: 'https://www.example.com/some/very/long/path?with=query&params=here',
	})
	readonly url!: string;

	@ApiProperty({
		description: 'The short code used to identify this URL',
		example: 'aB3xZ9',
	})
	readonly shortCode!: string;

	@ApiProperty({
		description: 'The full short URL ready to use',
		example: 'http://localhost:3000/aB3xZ9',
	})
	readonly shortUrl!: string;
}
