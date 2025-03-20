// helpers/logging.js

import { getEnv } from '@helpers/env.ts';
import chalk from 'chalk';
import { appendFileSync } from 'fs';

/**
 * Logging messages to the console or file
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
        
        console.log(`[${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')}] [${chalk.green('INFO')}]  ${message}`);
        
        if (getEnv('LOG_LEVEL') == 'info' || getEnv('LOG_LEVEL') == 'all') {
            appendFileSync(
                './logs/app.log',
                `[${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')}] [INFO]  ${message}\n`,
                'utf-8'
            );
        }
    }

    /**
     * Logs warning messages to the terminal.
     *
     * @param {string|number} message - The message that needs to be logged.
     * @returns void - Returns nothing.
     */
    static warn(message: string|number): void {
        const now = new Date();
        
        console.log(`[${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')}] [${chalk.yellow('WARN')}]  ${message}`);
        
        if (getEnv('LOG_LEVEL') == 'warn' || getEnv('LOG_LEVEL') == 'all') {
            appendFileSync(
                './logs/app.log',
                `[${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')}] [WARN]  ${message}\n`,
                'utf-8'
            );
        }
    }

    /**
     * Logs error messages to the terminal.
     *
     * @param {string|number} message - The message that needs to be logged.
     * @returns void - Returns nothing.
     */
    static error(message: string|number): void {
        const now = new Date();
        
        console.log(`[${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')}] [${chalk.red('ERROR')}] ${message}`);
        
        if (getEnv('LOG_LEVEL') == 'error' || getEnv('LOG_LEVEL') == 'all') {
            appendFileSync(
                './logs/app.log',
                `[${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')}] [ERROR] ${message}\n`,
                'utf-8'
            );
        }
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
        
        console.log(`[${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')}] [${chalk.blue('DEBUG')}] ${message}`);
        
        if (getEnv('LOG_LEVEL') == 'debug' || getEnv('LOG_LEVEL') == 'all') {
            appendFileSync(
                './logs/app.log',
                `[${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')}] [DEBUG] ${message}\n`,
                'utf-8'
            );
        }
    }
}
