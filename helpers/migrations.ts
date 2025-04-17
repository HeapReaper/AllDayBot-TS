import fs from 'fs';
import path from 'path';
import QueryBuilder from '@helpers/database';
import { getEnv } from '@helpers/env';
import { Logging } from '@helpers/logging';

export async function runMigrations(): Promise<void> {
    await QueryBuilder
        .raw(fs.readFileSync(`${<string>getEnv('MODULES_BASE_PATH')}migrations/01_create_migrations_table.sql`, 'utf-8'))
        .execute();

    const rows: any[] = await QueryBuilder
        .select('migrations')
        .columns(['name'])
        .execute();

    const appliedMigrations = new Set((rows as any[]).map(row => row.name));

    const migrationFiles = fs
        .readdirSync(`${<string>getEnv('MODULES_BASE_PATH')}migrations`)
        .filter((file) => file.endsWith('.sql'));

    for (const file of migrationFiles) {
        if (appliedMigrations.has(file)) continue;

        try {
            const migrationFile = fs.readFileSync(`${<string>getEnv('MODULES_BASE_PATH')}migrations/${file}`, 'utf-8');

            await QueryBuilder
                .raw(migrationFile)
                .execute();

            await QueryBuilder
                .insert('migrations')
                .values({name: `${file}`})
                .execute();

            Logging.info(`Migration ${file} successfully executed!`);
        } catch (error) {
            Logging.error(`Error in migration file: ${file}: ${error}`);
        }
    }
}