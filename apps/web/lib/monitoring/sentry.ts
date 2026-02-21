import * as Sentry from '@sentry/nextjs';

/**
 * Capture an exception and send it to Sentry
 * @param error Error to capture
 * @param captureContext Additional context (tags, extra data, etc.)
 */
export const captureError = (error: unknown, captureContext?: Parameters<typeof Sentry.captureException>[1]) => {
    Sentry.captureException(error, captureContext);
};

/**
 * Capture a simple message as an event
 * @param message Message to capture
 * @param captureContext Additional context
 */
export const captureMessage = (message: string, captureContext?: Parameters<typeof Sentry.captureMessage>[1]) => {
    Sentry.captureMessage(message, captureContext);
};

export { Sentry };
