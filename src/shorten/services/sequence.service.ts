import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';

@Injectable()
export class SequenceService {
	constructor(private readonly prismaService: PrismaService) {}

	public async getNextValue(): Promise<BigInt> {
		const res = await this.prismaService.$queryRaw`
            SELECT nextval('url_shortening_count') as next_val;
        `;
		const nextVal = res?.[0]?.next_val;
		if (!nextVal) {
			throw Error('Failed to get the next value of the sequence');
		}
		return nextVal;
	}
}
