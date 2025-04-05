import { Client, TextChannel } from 'discord.js';
import { getEnv } from '@helpers/env.ts';
import { Logging } from '@helpers/logging';
import Database from '@helpers/database';

export default class Events {
    private client: Client;

    constructor(client: Client) {
        this.client = client;
    }
}

