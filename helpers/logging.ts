// helpers/logging.js

import { getEnv } from '@helpers/env.ts';
import chalk from 'chalk';

/**
 * Logging messages to the console.
 *
 * @class Logging
 */
export class Logging {
    /**
     * Logs info messages to the terminal.
     *
     * @param {string|number} message - The message that needs to be logged.
     * @returns void - Returns nothing.
     */
    static info(message: string|number): void {
        const now = new Date();
        //console.log(`${chalk.green('INFO')} - ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()} - ${message}`);
        console.log(`[${now.getDate()}-${now.getMonth()}-${now.getFullYear()} ${now.getHours()}:${now.getMinutes()}:${now.getUTCSeconds()}] [${chalk.green('INFO')}]  ${message}`);
    }

    /**
     * Logs warning messages to the terminal.
     *
     * @param {string|number} message - The message that needs to be logged.
     * @returns void - Returns nothing.
     */
    static warn(message: string|number): void {
        const now = new Date();
        
        console.log(`[${now.getDate()}-${now.getMonth()}-${now.getFullYear()} ${now.getHours()}:${now.getMinutes()}:${now.getUTCSeconds()}] [${chalk.yellow('WARN')}]  ${message}`);
    }

    /**
     * Logs error messages to the terminal.
     *
     * @param {string|number} message - The message that needs to be logged.
     * @returns void - Returns nothing.
     */
    static error(message: string|number): void {
        const now = new Date();
        
        console.log(`[${now.getDate()}-${now.getMonth()}-${now.getFullYear()} ${now.getHours()}:${now.getMinutes()}:${now.getUTCSeconds()}] [${chalk.red('ERROR')}] ${message}`);
    }

    /**
     * Logs debug messages to the terminal.
     * It display the error message only if environment is set to 'debug'.
     *
     * @param {string|number} message - The message that needs to be logged.
     * @returns void - Returns nothing.
     */
    static debug(message: string|number): void {
        const now = new Date();
        
        if (getEnv('ENVIRONMENT') !== 'debug') return;
        
        console.log(`[${now.getDate()}-${now.getMonth()}-${now.getFullYear()} ${now.getHours()}:${now.getMinutes()}:${now.getUTCSeconds()}] [${chalk.blue('DEBUG')}] ${message}`);
    }
}
