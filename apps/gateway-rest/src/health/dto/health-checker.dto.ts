import { HealthCheckStatus, HealthIndicatorResult } from '@nestjs/terminus';

export class HealthCheckerResponseDto {
    details: HealthIndicatorResult;
    status: HealthCheckStatus;
}
