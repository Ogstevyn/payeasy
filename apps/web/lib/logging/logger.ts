import pino from 'pino';

// Define log level based on environment
const logLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

// Configure Pino
export const logger = pino({
    level: logLevel,
    formatters: {
        level: (label) => {
            return { level: label };
        },
    },
    redact: {
        paths: ['password', 'token', 'apiKey', 'authorization', 'cookie', 'secret', '*.password', '*.token', '*.apiKey', '*.authorization', '*.cookie', '*.secret'],
        censor: '[REDACTED]',
    },
    ...(process.env.NODE_ENV !== 'production' && {
        transport: {
            target: 'pino-pretty',
            options: {
                colorize: true,
                singleLine: true,
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname',
            },
        },
    }),
});
