import { ClientsModule, RedisOptions, TcpClientOptions, Transport } from '@nestjs/microservices';
import { APP_HOSTS, APP_PORTS } from '.';

export enum MICROSERVICE {
    GATEWAY_REST = 'GATEWAY_REST_MICROSERVICE',
    ITEMS = 'ITEMS_MICROSERVICE',
}

export const MICROSERVICES_TRANSPORTS: { [K in MICROSERVICE]: TcpClientOptions | RedisOptions } = {
    GATEWAY_REST_MICROSERVICE: {
        transport: Transport.TCP,
        options: {
            port: APP_PORTS.REST_GATEWAY,
            host: APP_HOSTS.REST_GATEWAY,
        },
    },
    ITEMS_MICROSERVICE: {
        transport: Transport.TCP,
        options: {
            port: APP_PORTS.ITEMS,
            host: APP_HOSTS.ITEMS,
        },
    },
};

export const GATEWAY_MICROSERVICES_CONNECTION = [
    ClientsModule.register([
        {
            name: MICROSERVICE.GATEWAY_REST,
            ...MICROSERVICES_TRANSPORTS.GATEWAY_REST_MICROSERVICE,
        },
        {
            name: MICROSERVICE.ITEMS,
            ...MICROSERVICES_TRANSPORTS.ITEMS_MICROSERVICE,
        },
    ]),
];
