import { Module } from '@nestjs/common';
import { ShortenModule } from 'src/shorten/shorten.module';
import { RedirectController } from './redirect.controller';
import { RedirectService } from './redirect.service';

@Module({
	imports: [ShortenModule],
	controllers: [RedirectController],
	providers: [RedirectService],
})
export class RedirectModule {}
