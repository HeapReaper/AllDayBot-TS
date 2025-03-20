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
     * @returns {void} - Returns nothing.
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
     * @param {string} sql - The query to execute.
     * @param {Array} params - Optional params.
     * @returns any - Returns result.
     */
    static query(sql: string, params: Array<any> = []): any {
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
     * Closed the database connection.
     *
     * @returns void - Returns nothing.
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
     * @param {string} table - Table name
     * @param {Array} columns - Array of column names. Defaults to "*" if empty.
     * @param {Object} conditions - Object with column-value pairs to filter results.
     * @returns Promise - Resolve to an array of results.
     */
    static async select(table: string, columns: string[] = ["*"], conditions: Record<string, any> = {}): Promise<any[]> {
        const columnClause = columns.length > 0 ? columns.join(", ") : "*";

        let whereClause: string = '';
        if (Object.keys(conditions).length > 0) {
            whereClause = ' WHERE ' + Object.entries(conditions)
                .map(([key, value]) => `${key} = ${typeof value === 'number' ? value : `'${value}'`}`)
                .join(' AND ');
        }

        Logging.debug(`SELECT ${columnClause} FROM ${table}${whereClause}`);
        return await Database.query(`SELECT ${columnClause} FROM ${table}${whereClause}`);
    }

    /**
     * Delete item(s) from the database.
     *
     * @param {string} table - The table name.
     * @param {Object} conditions - Object with column-value pairs to find specific entry to delete.
     * @returns Promise<void> - Returns Nothing.
     */
    static async delete(table: string, conditions: Record<string, any> = {}): Promise<void> {
        const whereClause = Object.entries(conditions)
            .map(([key, value]) => `${key} = '${value}'`)
            .join(', ');

        Logging.debug(`DELETE FROM ${table} WHERE ${whereClause}`);
        await Database.query(`DELETE FROM ${table} WHERE ${whereClause}`);
    }

    /**
     * Updates item(s) in the database.
     *
     * @param {string} table - The table name.
     * @param {Object} values - Object with key-value pairs.
     * @param {Object} conditions - Object with key-value pairs.
     * @returns Promise<void> -- Returns nothing.
     */
    static async update(table: string, values: Record<string, any>, conditions: Record<string, any>): Promise<void> {
        const setClause: string = Object.entries(values)
            .map(([key, value]) => `${key} = ${typeof value === 'number' || value === 'NOW()' ? value : `'${value}'`}`)
            .join(', ');

        const whereClause = Object.entries(conditions)
            .map(([key, value]) => `${key} = '${value}'`)
            .join(', ');

        Logging.debug(`UPDATE ${table} SET ${setClause} WHERE ${whereClause}`);
        if (!Database.query(`UPDATE ${table} SET ${setClause} WHERE ${whereClause}`)) {
            Logging.error(`Error updating table: ${table}`);
            return;
        }
    }

    /**
     * Inserts item(s) into the database.
     *
     * @param {string} table - The table name.
     * @param {Object} values - Object with column-value pairs to insert.
     * @returns Promise<void> - Returns nothing.
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

        Logging.debug(`INSERT INTO ${table} (${columns}) VALUES (${valuePlaceholders})`);
        await Database.query(`INSERT INTO ${table} (${columns}) VALUES (${valuePlaceholders})`);
    }
}

export default Database;