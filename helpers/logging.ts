// helpers/logging.js

import { config } from 'dotenv';
config();

export class Logging {
    static info(message) {
        console.log(`INFO: ${message}`);
    }

    static warn(message) {
        console.warn(`WARNING: ${message}`);
    }

    static error(message) {
        console.error(`ERROR: ${message}`);
    }

    static debug(message) {
        if (process.env.ENVIRONMENT !== 'debug') {
            return;
        }
        console.debug(`DEBUG: ${message}`);
    }
}
