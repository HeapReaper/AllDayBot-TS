import { Client, TextChannel } from 'discord.js';
import cron from 'node-cron';

export default class Tasks {
	private client: Client;

    constructor(client: Client) {
		this.client = client;
	}
}
