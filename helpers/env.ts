// helpers/env.ts

import { config } from 'dotenv';
import * as process from "node:process";
config();

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