import { Injectable } from '@nestjs/common';
import Base62Str from 'base62str';

@Injectable()
export class EncondingService {
	private readonly base62 = Base62Str.createInstance();

	encondeBase62(value: string) {
		return this.base62.encodeStr(value);
	}
}
