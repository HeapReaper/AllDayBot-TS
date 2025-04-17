import fs from 'fs';
import path from 'path';
import QueryBuilder from '@helpers/database';
import {getEnv} from "@helpers/env.ts";

export async function runMigrations(): Promise<void> {
    await QueryBuilder
        .raw(fs.readFileSync(`${<string>getEnv('MODULES_BASE_PATH')}migrations/01_create_migrations_table.sql`, 'utf-8'))
        .execute();
}