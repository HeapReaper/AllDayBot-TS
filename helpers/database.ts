// helpers/database.js

import {Logging} from './logging.ts';
import { config } from 'dotenv';
config();

import mysql from 'mysql2';
import { Connection } from 'mysql2/typings/mysql/lib/Connection';

class Database {
    static connection: Connection;

    static init() {
        if (!Database.connection) {
            // @ts-ignore
            Database.connection = mysql.createConnection({
                host: process.env.DATABASE_HOST,
                user: process.env.DATABASE_USER,
                password: process.env.DATABASE_PASSWORD,
                database: process.env.DATABASE_NAME,
                port: process.env.DATABASE_NAME,
            })
        }
    }

    static connect() {
        if (!Database.connection) {
            Database.init();
        }

        Database.connection.connect((err) => {
            if (!err) {
                Logging.debug('Connected to database');
                return;
            }

            Logging.error(`Database connection error inside helpers/database.js: ${err}`);
        })
    }

    static query(sql: string, params = []): any {
        return new Promise((resolve, reject) => {
            if (!Database.connection) {
                Database.init();
            }

            Database.connection.query(sql, params, (err, result) => {
                if (!err) {
                    resolve(result);
                }
                reject(err);
            })
        })
    }

    // @ts-nocheck
    static close(): void {
        if (Database.connection) {
            Database.connection.end((error: any) => {
                if (!err) {
                    Logging.debug('Database connection closed');
                    return;
                }
                Logging.error(`Error closing the database connection: ${error}`)
            });
        }
    }
}

export default Database;