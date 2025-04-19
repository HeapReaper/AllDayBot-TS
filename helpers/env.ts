import dotenv from 'dotenv';
import * as process from 'node:process';

dotenv.config({ path: '../.env' });

/**
 * Gets an environment value from .env
 *
 * @param {string} key - The environment key. Example: DISCORD_TOKEN.
 * @param {string} fallback - Fallback value. Defaults to an empty string.
 * @return {string|number|boolean|undefined} - Returns a string, number, boolean or undefined.
 */
export const getEnv = (key: string, fallback: string = ''): string|number|boolean|undefined => {
    const envValue: string|number|boolean|undefined = process.env[key];

    return envValue ? envValue : fallback;
}