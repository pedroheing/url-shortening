import { Module } from '@nestjs/common';
import { createEnvProvider } from 'src/core/config/config-factory';
import { ThrottleConfigService, ThrottleEnv } from './throttle-config.service';

@Module({
	providers: [createEnvProvider(ThrottleEnv), ThrottleConfigService],
	exports: [ThrottleConfigService],
})
export class ThrottleModule {}
