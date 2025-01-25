// logging.js

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
        console.debug(`DEBUG: ${message}`);
    }
}