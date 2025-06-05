import { Client } from 'discord.js';
import S3OperationBuilder from '@utils/s3';
import QueryBuilder from '@utils/database';

export default class Tasks {
    private client: Client;

    // @ts-ignore
    constructor(client: Client) {
        this.client = client;
    }
}