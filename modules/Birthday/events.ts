import { Client, TextChannel } from 'discord.js';
import { getEnv } from '@utils/env.ts';
import { Logging } from '@utils/logging';
import Database from '@utils/database';

export default class Events {
    private client: Client;

    constructor(client: Client) {
        this.client = client;
    }
}

