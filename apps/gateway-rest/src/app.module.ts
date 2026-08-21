import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ThrottlerModule } from '@nestjs/throttler';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule } from '@nestjs/microservices';
import { GATEWAY_MICROSERVICES_CONNECTION } from 'common/constants/global';
import { mainMongooseModule } from 'common/constants/database';
import { THROTTLER_OPTIONS } from 'common/microservices/services/gateway-rest/guards/constants';
import { HealthModule } from './health/health.module';
import { getMongooseModule } from 'common/helpers/database';
import { ItemsModule } from './items/items.module';

@Global()
@Module({
    imports: [
        ...GATEWAY_MICROSERVICES_CONNECTION,
        getMongooseModule(),
        mainMongooseModule,
        ThrottlerModule.forRoot([THROTTLER_OPTIONS.DEFAULT]),
        HealthModule,
        ItemsModule,
    ],
    controllers: [AppController],
    exports: [ClientsModule, MongooseModule],
})
export class AppModule {}
