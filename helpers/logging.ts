import { getEnv } from '@helpers/env.ts';
import chalk from 'chalk';
import { appendFileSync } from 'fs';

/**
 * A helper class for logging messages with different log levels.
 * Supports logging messages to the terminal and appending them to a log file
 * based of the environment en log level config
 *
 * @class Logging
 */
export class Logging {
    /**
     * Logs an informational message to the terminal and the log file (if the log level is 'info' or 'all').
     * The message is prefixed with a timestamp and the log level 'INFO'.
     *
     * @param {string|number} message - The message to be logged.
     * @returns {void} - This method does not return a value.
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
     * Logs a warning message to the terminal and the log file (if the log level is 'warn' or 'all').
     * The message is prefixed with a timestamp and the log level 'WARN'.
     *
     * @param {string|number} message - The warning message to be logged.
     * @returns {void} - This method does not return a value.
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
     * Logs an error message to the terminal and the log file (if the log level is 'error' or 'all').
     * The message is prefixed with a timestamp and the log level 'ERROR'.
     *
     * @param {string|number} message - The error message to be logged.
     * @returns {void} - This method does not return a value.
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
     * Logs a debug message to the terminal and the log file (if the environment is 'debug'
     * and the log level is 'debug' or 'all'). The message is prefixed with a timestamp and the log level 'DEBUG'.
     * Debug messages are only logged when the environment variable 'ENVIRONMENT' is set to 'debug'.
     *
     * @param {string|number} message - The debug message to be logged.
     * @returns {void} - This method does not return a value.
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
