import Base62Str from 'base62str';

export class Base62 {
	private static readonly base62 = Base62Str.createInstance();

	static enconde(str: string) {
		return this.base62.encodeStr(str);
	}

	static decode(str: string) {
		return this.base62.decodeStr(str);
	}
}
