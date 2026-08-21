import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { TerminusModule } from '@nestjs/terminus';
import { ThrottlerModule } from '@nestjs/throttler';
import { THROTTLER_OPTIONS } from 'common/microservices/services/gateway-rest/guards/constants';

@Module({
    imports: [TerminusModule, ThrottlerModule.forRoot([THROTTLER_OPTIONS.DEFAULT])],
    controllers: [HealthController],
})
export class HealthModule {}
