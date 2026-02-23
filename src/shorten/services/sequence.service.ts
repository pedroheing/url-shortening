import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';

@Injectable()
export class SequenceService {
	constructor(private readonly prismaService: PrismaService) {}

	public async getNextValue(): Promise<number> {
		const res = await this.prismaService.$queryRaw`
            SELECT nextval('url_shortening_count');
        `;
		return res?.[0]?.nextval;
	}
}
