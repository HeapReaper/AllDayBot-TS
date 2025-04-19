import { writeFileSync } from 'fs';
import * as process from 'node:process';
import { getEnv } from '@utils/env';

if (process.argv.slice(2).length  < 1) {
    console.error('Please specify the migration name you weirdo!');
    process.exit();
}

const migrationDir: string = `${<string>getEnv('MODULES_BASE_PATH')}migrations`;
const migrationFileName: string = `${Math.floor(Date.now() / 1000)}-${process.argv.slice(2)[0]}.sql`;

console.info(`Creating migration ${migrationDir}/${migrationFileName}`);

writeFileSync(`${migrationDir}/${migrationFileName}`, '');