// helpers/logging.js

import { getEnv } from '@helpers/env.ts';

/**
 * A helper class for logging messages to the console.
 *
 * @class Logging
 */
export class Logging {
    /**
     * Logs info messages to the terminal.
     *
     * @param {string} message - The message that needs to be logged.
     * @returns void - Returns nothing.
     */
    static info(message: string): void {
        console.log(`INFO: ${message}`);
    }

    /**
     * Logs warning messages to the terminal.
     *
     * @param {string} message - The message that needs to be logged.
     * @returns void - Returns nothing.
     */
    static warn(message: string): void {
        console.warn(`WARNING: ${message}`);
    }

    /**
     * Logs error messages to the terminal.
     *
     * @param {string} message - The message that needs to be logged.
     * @returns void - Returns nothing.
     */
    static error(message: string): void {
        console.error(`ERROR: ${message}`);
    }

    /**
     * Logs debug messages to the terminal.
     * It display the error message only if environment is set to 'debug'.
     *
     * @param {string} message - The message that needs to be logged.
     * @returns void - Returns nothing.
     */
    static debug(message: string): void {
        if (getEnv('ENVIRONMENT') !== 'debug') return;

        console.debug(`DEBUG: ${message}`);
    }
}
