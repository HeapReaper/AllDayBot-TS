// helpers/database.js

import {Logging} from './logging.ts';
import { getEnv } from '@helpers/env.ts';
import mysql from 'mysql2';
import { Connection } from 'mysql2/typings/mysql/lib/Connection';

class Database {
    static connection: Connection;

    static init() {
        if (!Database.connection) {
            // @ts-ignore
            Database.connection = mysql.createConnection({
                host: getEnv('DATABASE_HOST'),
                user: getEnv('DATABASE_USER'),
                password: getEnv('DATABASE_PASSWORD'),
                database: getEnv('DATABASE_NAME'),
            })
        }
    }

    /**
     * Opens the database connection
     *
     * @returns void
     */
    static connect(): void {
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

    /**
     * Executes an query
     *
     * @param sql - The query
     * @param params - Optional params
     * @returns any
     */
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
    /**
     * Closed the database connection
     *
     * @returns void
     */
    static close(): void {
        if (Database.connection) {
            Database.connection.end((error: any) => {
                if (!error) {
                    Logging.debug('Database connection closed');
                    return;
                }
                Logging.error(`Error closing the database connection: ${error}`)
            });
        }
    }

    /**
     * Retrieves item(s) from the database.
     *
     * @param table - Table name
     * @param columns - Array of column names. Defaults to "*" if empty.
     * @param conditions - Object with column-value pairs to filter results.
     * @returns Promise - Resolve to an array of results
     */
    static async select(table: string, columns: string[] = ["*"], conditions: Record<string, any> = {}): Promise<any[]> {
        const columnClause = columns.length > 0 ? columns.join(", ") : "*";

        let whereClause: string = '';
        if (Object.keys(conditions).length > 0) {
            whereClause = ' WHERE ' + Object.entries(conditions)
                .map(([key, value]) => `${key} = ${typeof value === 'number' ? value : `'${value}'`}`)
                .join(' AND ');
        }

        return await Database.query(`SELECT ${columnClause} FROM ${table}${whereClause}`);
    }

    /**
     * Delete item(s) from the database.
     *
     * @param table - The table name
     * @param conditions - Object with column-value pairs to find specific entry to delete
     * @returns Promise<void>
     */
    static async delete(table: string, conditions: Record<string, any> = {}): Promise<void> {
        const whereClause = Object.entries(conditions)
            .map(([key, value]) => `${key} = '${value}'`)
            .join(', ');

        await Database.query(`DELETE FROM ${table}${whereClause}`);
    }

    /**
     * Updates item(s) in the database.
     *
     * @param table - Table name.
     * @param values - Object with key-value pairs.
     * @param conditions - Object with key-value pairs.
     * @returns Promise<void>
     */
    static async update(table: string, values: Record<string, any>, conditions: Record<string, any>): Promise<void> {
        const setClause: string = Object.entries(values)
            .map(([key, value]) => `${key} = ${typeof value === 'number' || value === 'NOW()' ? value : `'${value}'`}`)
            .join(', ');

        const whereClause = Object.entries(conditions)
            .map(([key, value]) => `${key} = '${value}'`)
            .join(', ');

        if (!Database.query(`UPDATE ${table} SET ${setClause} WHERE ${whereClause}`)) {
            Logging.error(`Error updating table: ${table}`);
            return;
        }
    }

    /**
     * Inserts item(s) into the database.
     *
     * @param table - The table name
     * @param values - Object with column-value pairs to insert
     * @returns Promise<void>
     */
    static async insert(table: string, values: Record<string, any>): Promise<void> {
        const columns: string = Object.keys(values).join(', ');

        const valuePlaceholders = Object.values(values)
            .map(value => {
                switch (value) {
                    case typeof value === 'number':
                        return value;
                    case typeof value === 'string':
                        return value.toUpperCase() === 'NOW()' ? value : `'${value.replace(/'/g, "''")}'`;
                    default:
                        return `'${String(value).replace(/'/g, "''")}'`;
                }
            })
            .join(', ');

        await Database.query(`INSERT INTO ${table} (${columns}) VALUES (${valuePlaceholders})`);
    }
}

export default Database;