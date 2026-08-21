import { LoggerOptions, transports, format } from 'winston';
import * as Transport from 'winston-transport';
import { utilities } from 'nest-winston';
import { ConsoleTransportInstance } from 'winston/lib/winston/transports';
import { PROJECT_NAME } from '../helpers';
import LokiTransport from 'winston-loki';

const CONSOLE_LOG_TRANSPORT_CONFIG: ConsoleTransportInstance = new transports.Console({
    format: format.combine(
        format.timestamp({ format: 'DD/MM/YYYY HH:mm:ss Z' }),
        format.cli(),
        format.splat(),
        format.colorize({ message: true, all: true }),
        format.prettyPrint(),
        utilities.format.nestLike(PROJECT_NAME, { colors: true, prettyPrint: true }),
    ),
    handleExceptions: true,
    handleRejections: true,
});

const LOGGER_TRANSPORTS: Array<Transport> = [CONSOLE_LOG_TRANSPORT_CONFIG];

const isLokiEnabled = (): boolean => {
    const lokiUrl = process.env.LOKI_URL?.trim();
    if (!lokiUrl || process.env.LOKI_ENABLED === 'false') {
        return false;
    }
    return !/(localhost|127\.0\.0\.1)/i.test(lokiUrl);
};

if ((process.env.NODE_ENV === 'staging' || process.env.NODE_ENV === 'production') && isLokiEnabled()) {
    LOGGER_TRANSPORTS.push(
        new LokiTransport({
            host: process.env.LOKI_URL!.trim(),
            json: true,
            format: format.json(),
            labels: {
                appName: PROJECT_NAME,
                env: process.env.NODE_ENV,
            },
            onConnectionError: err => {
                console.error('ERROR CONNECTING WITH LOKI:', err);
            },
        }),
    );
}

export const LOGGER_CONFIG_OPTIONS: LoggerOptions = {
    transports: LOGGER_TRANSPORTS,
    exitOnError: false,
    defaultMeta: {
        env: process.env.NODE_ENV,
    },
};
