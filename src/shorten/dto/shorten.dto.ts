import { IsNotEmpty, IsString } from 'class-validator';

export class ShortenDto {
	@IsNotEmpty()
	@IsString()
	readonly url!: string;
}
