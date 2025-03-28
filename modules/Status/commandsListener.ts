// modules/Status/commandsListener.ts

import { Client, Interaction, Events, MessageFlags} from 'discord.js';
import Database from '@helpers/database';
import { Logging } from '@helpers/logging';

export default class CommandsListener {
	private client: Client;

	constructor(client: Client) {
		this.client = client;
		void this.commandsListener();
	}
}

async function commandsListener(): Promise<void> {
	//
}
