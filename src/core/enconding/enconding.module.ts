import { Module } from '@nestjs/common';
import { EncondingService } from './enconding.service';

@Module({
	providers: [EncondingService],
	exports: [EncondingService],
})
export class EncondingModule {}
