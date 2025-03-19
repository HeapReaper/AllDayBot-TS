// modules/Birthday/commandsListener.ts

import { Client, Interaction, Events } from 'discord.js';
import Database from '@helpers/database';

export default class CommandsListener {
    private client: Client;
	
	constructor(client: Client) {
		this.client = client;
		void this.commandListener();
	}
	
	async commandListener(): Promise<void> {
		this.client.on(Events.InteractionCreate, async (interaction: Interaction): Promise<void> => {
			if (!interaction.isCommand()) return;
			
			const { commandName } = interaction;
		})
	}
}