import { Controller, Get, HttpStatus, VERSION_NEUTRAL, Version } from '@nestjs/common';
import { API_VERSIONS } from 'common/microservices/services/gateway-rest/constants';
import { API_ENDPOINTS } from 'common/microservices/services/gateway-rest/rest-routes';

@Controller({
    version: API_VERSIONS.V1,
})
export class AppController {
    @Get()
    @Version(VERSION_NEUTRAL)
    root(): string {
        return 'It is working';
    }

    @Get(API_ENDPOINTS.GATEWAY.READY)
    async apiGatewayReady(): Promise<{ status: number }> {
        return { status: HttpStatus.OK };
    }
}
