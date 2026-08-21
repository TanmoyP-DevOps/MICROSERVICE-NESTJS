import { minutes } from '@nestjs/throttler';

export const THROTTLER_OPTIONS = {
    DEFAULT: {
        name: 'default',
        ttl: minutes(10),
        limit: 1000,
    },
    HEALTH: {
        default: {
            ttl: minutes(1),
            limit: 10,
        },
    },
};
