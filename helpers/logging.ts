// helpers/logging.js

import { config } from 'dotenv';
config();

export class Logging {
    static info(message: string): void {
        console.log(`INFO: ${message}`);
    }

    static warn(message: string): void {
        console.warn(`WARNING: ${message}`);
    }

    static error(message: string): void {
        console.error(`ERROR: ${message}`);
    }

    static debug(message: string): void {
        if (process.env.ENVIRONMENT !== 'debug') {
            return;
        }
        console.debug(`DEBUG: ${message}`);
    }
}
