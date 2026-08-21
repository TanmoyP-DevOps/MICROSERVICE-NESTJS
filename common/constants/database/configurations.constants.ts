import { MongooseModule } from '@nestjs/mongoose';
import { DATABASE } from '../global';

export const mainMongooseModule = MongooseModule.forRoot(DATABASE.MONGO.URL, {
    dbName: DATABASE.MONGO.NAME,
});

const TEST_MONGO_URL = 'mongodb://root:root@localhost:27963/?authMechanism=DEFAULT';

export const testGatewayRestMongooseModule = MongooseModule.forRoot(TEST_MONGO_URL, {
    dbName: `test-gateway-rest-${DATABASE.MONGO.NAME}`,
});
