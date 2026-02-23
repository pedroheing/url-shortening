import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateOriginalUrlDto {
	@IsNotEmpty()
	@IsString()
	readonly url!: string;
}
