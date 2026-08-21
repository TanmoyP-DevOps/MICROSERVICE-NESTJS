import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { getMicroservicesConfigurations } from 'common/helpers/global';
import { MICROSERVICE } from 'common/constants/global';
import { ItemsModule } from './items.module';

async function bootstrap() {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
        ItemsModule,
        getMicroservicesConfigurations(MICROSERVICE.ITEMS),
    );
    app.listen();
}
bootstrap();
