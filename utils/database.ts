import { getEnv } from '@utils/env';
import mysql, {QueryResult} from 'mysql2';
import { Connection } from 'mysql2/typings/mysql/lib/Connection';
import {Logging} from '@utils/logging';

/**
 * Database abstraction.
 * @method connect - not needed.
 * @method close - not needed.
 * @method select - table name string.
 * @method update - table name string.
 * @method delete - table name string.
 * @method insert - table name string.
 * @method columns - ['column_name']
 * @method where - {key: value}
 * @method limit - integer
 * @method execute -
 * @returns - wop
 */
class QueryBuilder {
    static connection: Connection;
    private tableName: string | undefined;
    private columnsArray: string[] = ['*'];
    private whereClause: {} = {};
    private orderByColumnName: string | null = null;
    private orderByDirection: 'ASC' | 'DESC' = 'DESC';
    private limitNumber: number | null = null;
    private currentMode: string = '';
    private firstMode: Boolean = false;
    private updateValues: Record<string, any> = {};
    private insertValues: Record<string, any> = {};
    private countBoolean: Boolean = false;
    private loggingEnabled: boolean = false;
    private rawQuery: string = '';

    static init() {
        QueryBuilder.connection = mysql.createConnection({
            host: <string>getEnv('DATABASE_HOST'),
            user: <string>getEnv('DATABASE_USER'),
            password: <string>getEnv('DATABASE_PASSWORD'),
            database: <string>getEnv('DATABASE_NAME'),
        });
    }

    static connect(): void {
        if (QueryBuilder.connection) return;
        QueryBuilder.init();
    }

    static close(): void {
        if (!QueryBuilder.connection) return;
        QueryBuilder.connection.end();
    }

    static select(tableName: string): QueryBuilder {
        const builder = new QueryBuilder();
        builder.tableName = tableName;
        builder.currentMode = 'select';
        return builder;
    }

    static update(tableName: string) {
        const builder = new QueryBuilder();
        builder.tableName = tableName;
        builder.currentMode = 'update';
        return builder;
    }

    static delete(tableName: string) {
        const builder = new QueryBuilder();
        builder.tableName = tableName;
        builder.currentMode = 'delete';
        return builder;
    }

    static insert(tableName: string) {
        const builder = new QueryBuilder();
        builder.tableName = tableName;
        builder.currentMode = 'insert';
        return builder;
    }

    static raw(query: string): QueryBuilder {
        const builder = new QueryBuilder();
        builder.currentMode = 'raw';
        builder.rawQuery = query;
        return builder;
    }

    logging(enabled: boolean): QueryBuilder {
        this.loggingEnabled = enabled;
        return this;
    }

    columns(columns: string[]): QueryBuilder {
        this.columnsArray = columns;
        return this;
    }

    where(conditions: Record<string, any>): QueryBuilder {
        this.whereClause = conditions;
        return this;
    }

    limit(limit: number): QueryBuilder {
        this.limitNumber = limit;
        return this;
    }

    orderBy(column: string, direction: 'ASC' | 'DESC' = 'DESC'): QueryBuilder {
        this.orderByColumnName = column;
        this.orderByDirection = direction;
        return this;
    }

    set(values: Record<string, any>): QueryBuilder {
        this.updateValues = values;
        return this;
    }

    values(values: Record<string, any>): QueryBuilder {
        this.insertValues = values;
        return this;
    }

    count(): QueryBuilder {
        this.countBoolean = true;
        return this;
    }

    private async executeSelect(): Promise<any> {
        if (!QueryBuilder.connection) QueryBuilder.connect();

        let countString: string = '';
        this.countBoolean ? countString = 'COUNT(*) ' : countString = '';

        let columnClause = this.columnsArray.join(', ');

        if (countString && columnClause[0] === '*') {
            columnClause = '';
        }

        let whereString: string = '';
        const whereValues: any[] = []
        if (Object.keys(this.whereClause).length > 0) {
            whereString = ' WHERE ' + Object.entries(this.whereClause)
                .map(([key, value]) => {
                    whereValues.push(value);
                    return `${key} = ?`;
                })
                .join(' AND ');
        }

        let orderByString: string = '';
        if (this.orderByColumnName !== null) orderByString = ` ORDER BY ${this.orderByColumnName} ${this.orderByDirection}`;

        let limitString: string = '';
        this.limitNumber !== null ? limitString = ` LIMIT ${this.limitNumber}` : limitString = ''

        const sql = `SELECT ${countString}${columnClause} FROM ${this.tableName}${whereString}${orderByString}${limitString}`;

        Logging.debug(`Selecting: ${sql}`);

        const startTime: number = Date.now();

        return new Promise((resolve, reject) => {
            QueryBuilder.connection.query(sql, whereValues, (err, res: any) => {
                if (this.loggingEnabled) Logging.info(`Select query duration: ${Date.now() - startTime}ms`);

                if (err) return reject(err);

                if (this.firstMode) return resolve(res[0]);

                if (this.countBoolean) return resolve(res[0]['COUNT(*)']);

                return resolve(res);
            })
        })
    }

    private async executeUpdate(): Promise<any> {
        if (!QueryBuilder.connection) QueryBuilder.connect();

        let updateString = ' SET ' + Object.entries(this.updateValues)
            .map(([key, value]) => `${key} = ?`)
            .join(', ');

        let whereString = '';
        const whereValues: any[] = Object.values(this.updateValues);

        if (Object.keys(this.whereClause).length > 0) {
            whereString = ' WHERE ' + Object.entries(this.whereClause)
                .map(([key, value]) => {
                    whereValues.push(value);
                    return `${key} = ?`;
                })
                .join(' AND ');
        }


        const sql = `UPDATE ${this.tableName}${updateString}${whereString}`;

        Logging.debug(`Updating: ${sql}`);

        const startTime: number = Date.now();

        return new Promise((resolve, reject) => {
            QueryBuilder.connection.query(sql, whereValues, (err, res) => {
                if (this.loggingEnabled) Logging.info(`Update query duration: ${Date.now() - startTime}ms`);

                if (err) return reject(err);

                resolve(res);
            })
        })
    }

    private async executeDelete(): Promise<any> {
        if (!QueryBuilder.connection) QueryBuilder.connect();

        let whereString: string = '';
        const whereValues: any[] = []
        if (Object.keys(this.whereClause).length > 0) {
            whereString = ' WHERE ' + Object.entries(this.whereClause)
                .map(([key, value]) => {
                    whereValues.push(value);
                    return `${key} = ?`;
                })
                .join(' AND ');
        }

        const sql = `DELETE FROM ${this.tableName}${whereString}`;

        Logging.debug(`Deleting: ${sql}`);

        const startTime: number = Date.now();

        return new Promise((resolve, reject) => {
            QueryBuilder.connection.query(sql, whereValues, (err, res) => {
                if (this.loggingEnabled) Logging.info(`Delete query duration: ${Date.now() - startTime}ms`);

                if (err) return reject(err);

                resolve(res);
            })
        })
    }

    private async executeInsert(): Promise<any> {
        if (!QueryBuilder.connection) QueryBuilder.connect();

        const columns = Object.keys(this.insertValues).join(', ');
        const placeholders = Object.values(this.insertValues).map(() => '?').join(', ');
        const values = Object.values(this.insertValues);

        const sql = `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders})`;

        Logging.debug(`Inserting: ${sql}`);

        const startTime: number = Date.now();

        return new Promise((resolve, reject) => {
            QueryBuilder.connection.query(sql, values, (err, res) => {
                if (this.loggingEnabled) Logging.info(`Insert query duration: ${Date.now() - startTime}ms`);

                if (err) return reject(err);

                resolve(res);
            })
        })
    }

    private async executeRaw(): Promise<any> {
        if (!QueryBuilder.connection) QueryBuilder.connect();

        const startTime: number = Date.now();

        return new Promise<any>((resolve, reject) => {
            QueryBuilder.connection.query(this.rawQuery, (err, res) => {
                if (this.loggingEnabled) Logging.info(`Raw query duration: ${Date.now() - startTime}ms`);

                if (err) return reject(err);

                resolve(res);
            })
        })
    }

    async first(): Promise<any> {
        this.firstMode = true;
        return await this.executeSelect();
    }

    async get(): Promise<any> {
        return await this.executeSelect();
    }

    // @ts-ignore
    async execute(): Promise<any[]> {
        switch (this.currentMode) {
            case 'select':
                return await this.executeSelect();
            case 'update':
                return await this.executeUpdate();
            case 'delete':
                return await this.executeDelete();
            case 'insert':
                return await this.executeInsert();
            case 'raw':
                return await this.executeRaw();
        }
    }
}

// await QueryBuilder.insert('leveling').values({ user_id: '12345', xp: 0, level: 1 }).execute();
// await QueryBuilder.update('leveling').set({ xp: 100 }).where({ id: 1 }).execute();
// await QueryBuilder.delete('leveling').where({ id: 1 }).execute();

export default QueryBuilder;