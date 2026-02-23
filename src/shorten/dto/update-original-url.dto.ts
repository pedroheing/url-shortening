import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateOriginalUrlDto {
	@ApiProperty({
		description: 'The new original URL to replace the current one',
		example: 'https://www.example.com/updated/path',
	})
	@IsNotEmpty()
	@IsString()
	readonly url!: string;
}
