import { Module } from '@nestjs/common';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { getMongooseModule } from 'common/helpers/database';
import { mainMongooseModule } from 'common/constants/database';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    imports: [getMongooseModule(), mainMongooseModule],
    controllers: [ItemsController],
    providers: [ItemsService],
    exports: [MongooseModule],
})
export class ItemsModule {}
