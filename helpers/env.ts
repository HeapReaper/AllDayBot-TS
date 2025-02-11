// helpers/env.ts

import { config } from 'dotenv';
import * as process from 'node:process';
config();

/**
 * Gets an environment value from .env
 *
 * @param {string} key - The environment key. Example: DISCORD_TOKEN.
 * @param {string} fallback - Fallback value. Defaults to an empty string.
 * @return {string|undefined} - Returns a string or undefined.
 */
export const getEnv = (key: string, fallback: string = ''): string|undefined => {
    const envValue: string|undefined = process.env[key];

    if (envValue) {
        return envValue;
    }

    if (fallback) {
        return fallback;
    }

    return undefined;
}