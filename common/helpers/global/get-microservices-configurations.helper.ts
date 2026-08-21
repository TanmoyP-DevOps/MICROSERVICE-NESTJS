import { WinstonModule } from 'nest-winston';
import { LOGGER_CONFIG_OPTIONS } from '../../constants/logger/config.constant';
import { MICROSERVICE, MICROSERVICES_TRANSPORTS } from '../../constants/global/gateway-microservices.constants';
import { NestApplicationContextOptions } from '@nestjs/common/interfaces/nest-application-context-options.interface';
import { NestApplicationOptions } from '@nestjs/common';

export const getMicroservicesConfigurations = (
    microserviceName: MICROSERVICE,
): NestApplicationContextOptions & NestApplicationOptions => {
    return {
        ...MICROSERVICES_TRANSPORTS[microserviceName],
        cors: microserviceName === MICROSERVICE.GATEWAY_REST ? true : false,
        logger: WinstonModule.createLogger({
            ...LOGGER_CONFIG_OPTIONS,
            defaultMeta: {
                microservice: microserviceName,
                env: process.env.NODE_ENV,
            },
        }),
    };
};
