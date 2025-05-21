import { getEnv } from '@utils/env.ts';
import chalk from 'chalk';
import { appendFileSync } from 'fs';

export class Logging {
    static info(message: string|number): void {
        const now = new Date();

        console.log(`[${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')}] [${chalk.green('INFO')}]  ${message}`);

        if (getEnv('LOG_LEVEL') == 'info' || getEnv('LOG_LEVEL') == 'all') {
            appendFileSync(
                `${<string>getEnv('MODULES_BASE_PATH')}logs/app.log`,
                `[${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')}] [INFO]  ${message}\n`,
                'utf-8'
            );
        }
    }

    static warn(message: string|number): void {
        const now = new Date();

        console.log(`[${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')}] [${chalk.yellow('WARN')}]  ${message}`);

        if (getEnv('LOG_LEVEL') == 'warn' || getEnv('LOG_LEVEL') == 'all') {
            appendFileSync(
                `${<string>getEnv('MODULES_BASE_PATH')}logs/app.log`,
                `[${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')}] [WARN]  ${message}\n`,
                'utf-8'
            );
        }
    }

    static error(message: string|number): void {
        const now = new Date();

        console.log(`[${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')}] [${chalk.red('ERROR')}] ${message}`);

        if (getEnv('LOG_LEVEL') == 'error' || getEnv('LOG_LEVEL') == 'all') {
            appendFileSync(
                `${<string>getEnv('MODULES_BASE_PATH')}logs/app.log`,
                `[${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')}] [ERROR] ${message}\n`,
                'utf-8'
            );
        }

        if (getEnv('LOG_DISCORD')) {
            void this.sendLogToDiscord(message);
        }
    }

    static debug(message: string|number): void {
        const now = new Date();

        if (getEnv('ENVIRONMENT') !== 'debug') return;

        console.log(`[${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')}] [${chalk.blue('DEBUG')}] ${message}`);

        if (getEnv('LOG_LEVEL') == 'debug' || getEnv('LOG_LEVEL') == 'all') {
            appendFileSync(
                `${<string>getEnv('MODULES_BASE_PATH')}logs/app.log`,
                `[${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')}] [DEBUG] ${message}\n`,
                'utf-8'
            );
        }
    }

    private static async sendLogToDiscord(error: string|number): Promise<void> {
        const webhookURL: string = <string>getEnv('LOG_DISCORD_WEBHOOK');

        if (!webhookURL) {
            Logging.error(`Could not find webhook URL in "sendLogToDiscord"`);
            return;
        }

        try {
            await fetch(webhookURL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: `${<string>getEnv('LOG_DISCORD_TAG')}Bot error: ${error}`,
                }),
            });
        } catch (error: any) {
            Logging.error(error);
        }
    }
}