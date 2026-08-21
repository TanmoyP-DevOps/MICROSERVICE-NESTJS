import { MongooseModule } from '@nestjs/mongoose';
import { DynamicModule } from '@nestjs/common';
import mongooseHidden from 'mongoose-hidden';
import { Item, ItemSchema } from 'database/schemas';

export const getMongooseModule = (): DynamicModule => {
    return MongooseModule.forFeatureAsync([
        {
            name: Item.name,
            useFactory: () => {
                const schema = ItemSchema;
                schema.plugin(mongooseHidden({ defaultHidden: {} }));
                return schema;
            },
        },
    ]);
};
