import 'dotenv/config';

export const APP_PORTS = {
    REST_GATEWAY: Number(process.env.GATEWAY_REST_PORT),
    REDIS: Number(process.env.REDIS_PORT),
    REDIS_TEST: 6378,
    ITEMS: Number(process.env.ITEMS_MICROSERVICE_PORT),
};

export const APP_HOSTS = {
    REDIS: process.env.REDIS_HOST,
    REST_GATEWAY: process.env.GATEWAY_REST_HOST,
    ITEMS: process.env.ITEMS_MICROSERVICE_HOST,
};

export const REDIS = {
    PASSWORD: process.env.REDIS_PASSWORD,
};

export const DATABASE = {
    MONGO: {
        URL: process.env.MONGO_URL,
        NAME: process.env.MONGO_DB_NAME,
        validateConnection: () => {
            if (process.env.NODE_ENV === 'test') {
                const currentUrl =
                    process.env.NODE_ENV === 'test'
                        ? 'mongodb://root:root@localhost:27963/?authMechanism=DEFAULT'
                        : process.env.MONGO_URL;

                if (currentUrl?.includes('staging') || currentUrl?.includes('production')) {
                    throw new Error('Cannot use staging/production DB in test environment');
                }
            }
            return true;
        },
    },
};

export const NODE_ENVIRONMENTS = {
    IS_PROD_ENV: process.env.NODE_ENV ? process.env.NODE_ENV === 'production' : false,
    IS_TEST_ENV: process.env.NODE_ENV ? process.env.NODE_ENV === 'test' : false,
    IS_DEV_ENV: process.env.NODE_ENV ? process.env.NODE_ENV === 'development' : false,
    IS_STAGING_ENV: process.env.NODE_ENV ? process.env.NODE_ENV === 'staging' : false,
};
