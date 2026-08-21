import { LOGGER_CONFIG_OPTIONS } from '../../../common/constants/logger/config.constant';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { useContainer } from 'class-validator';
import { APP_PORTS, MICROSERVICE } from 'common/constants/global';
import { API_VERSIONS } from 'common/microservices/services/gateway-rest/constants';
import { getMicroservicesConfigurations } from 'common/helpers/global';
import { WinstonModule } from 'nest-winston';

async function bootstrap() {
    const logger = WinstonModule.createLogger({
        ...LOGGER_CONFIG_OPTIONS,
        defaultMeta: {
            microservice: MICROSERVICE.GATEWAY_REST,
            env: process.env.NODE_ENV,
        },
    });
    logger.log('Starting Gateway REST', 'AppBootstrap');
    const app = await NestFactory.create(AppModule, {
        ...getMicroservicesConfigurations(MICROSERVICE.GATEWAY_REST),
        rawBody: true,
    });

    app.enableVersioning({ type: VersioningType.URI, defaultVersion: API_VERSIONS.V1 });

    app.useGlobalPipes(
        new ValidationPipe({
            validateCustomDecorators: true,
            whitelist: true,
            forbidNonWhitelisted: true,
        }),
    );

    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    const config = new DocumentBuilder()
        .setTitle('Microservice NestJS API')
        .setDescription('REST gateway in front of TCP microservices.')
        .setVersion('1.0')
        .setExternalDoc('JSON Schema', '/docs-json')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, {
        jsonDocumentUrl: '/docs-json',
        swaggerOptions: {
            tagsSorter: 'alpha',
            operationsSorter: 'alpha',
            filter: true,
        },
        explorer: false,
    });

    await app.startAllMicroservices();
    await app.listen(APP_PORTS.REST_GATEWAY);
    logger.log(`Gateway REST listening on ${APP_PORTS.REST_GATEWAY}`, 'AppBootstrap');
}
bootstrap();
