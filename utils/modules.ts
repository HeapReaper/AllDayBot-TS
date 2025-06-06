import fs from 'fs/promises';
import path from 'path';
import { pathToFileURL } from 'url';
import { Logging } from '@utils/logging';
import { getEnv } from '@utils/env';

export class Modules {
    // Module Loader

    // GetModule names
    static async getModulesNames() {
        return await fs.readdir(path.join(<string>getEnv('MODULES_BASE_PATH'), 'modules'));
    }
}