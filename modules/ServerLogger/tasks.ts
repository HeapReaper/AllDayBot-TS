import { Client } from 'discord.js';
import S3OperationBuilder from '@helpers/s3';
import QueryBuilder from '@helpers/database';

export default class Tasks {
    private client: Client;

    // @ts-ignore
    constructor(client: Client) {
        this.client = client;
        setInterval(async () => {
            void this.cleanUpCache();
        }, 60000);
    }

    async cleanUpCache() {
    }
}