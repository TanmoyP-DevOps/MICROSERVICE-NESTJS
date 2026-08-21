import { Controller, Get } from '@nestjs/common';
import { RedisOptions, TcpClientOptions } from '@nestjs/microservices';
import { MICROSERVICE, MICROSERVICES_TRANSPORTS } from 'common/constants/global';
import { THROTTLER_OPTIONS } from 'common/microservices/services/gateway-rest/guards/constants';
import { Throttle } from '@nestjs/throttler';
import {
    HealthCheck,
    DiskHealthIndicator,
    MemoryHealthIndicator,
    MicroserviceHealthIndicator,
    HealthCheckService,
    MicroserviceHealthIndicatorOptions,
} from '@nestjs/terminus';
import { HEALTH_CONSTANTS } from 'common/constants/health';
import { ApiTags } from '@nestjs/swagger';
import * as os from 'os';
import { HealthCheckerResponseDto } from './dto';

@Controller('health')
@ApiTags('Health')
export class HealthController {
    constructor(
        private health: HealthCheckService,
        private disk: DiskHealthIndicator,
        private memory: MemoryHealthIndicator,
        private microservice: MicroserviceHealthIndicator,
    ) {}

    @Get()
    @HealthCheck({ noCache: true, swaggerDocumentation: true })
    @Throttle(THROTTLER_OPTIONS.HEALTH)
    async healthChecker(): Promise<HealthCheckerResponseDto> {
        const microservices = Object.values(MICROSERVICE).filter(name => name !== MICROSERVICE.GATEWAY_REST);

        const microserviceChecks = microservices.map(microservice => {
            const transport = MICROSERVICES_TRANSPORTS[
                microservice as keyof typeof MICROSERVICES_TRANSPORTS
            ] as MicroserviceHealthIndicatorOptions;
            return async () => this.microservice.pingCheck<RedisOptions | TcpClientOptions>(microservice, transport);
        });

        const result = await this.health.check([
            ...microserviceChecks,
            async () => this.memory.checkHeap('memory-heap', HEALTH_CONSTANTS.MEMORY_HEAP_THRESHOLD),
            async () => this.memory.checkRSS('memory-rss', HEALTH_CONSTANTS.MEMORY_RSS_THRESHOLD),
            async () =>
                this.disk.checkStorage('disk-storage', {
                    path: os.homedir(),
                    thresholdPercent: HEALTH_CONSTANTS.DISK_STORAGE_PERCENTAGE_THRESHOLD,
                }),
        ]);

        return {
            details: result.details,
            status: result.status,
        };
    }
}
