import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ShortenDto {
	@ApiProperty({
		description: 'The original URL to be shortened',
		example: 'https://www.example.com/some/very/long/path?with=query&params=here',
	})
	@IsNotEmpty()
	@IsString()
	readonly url!: string;
}
