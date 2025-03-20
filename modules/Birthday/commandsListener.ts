// modules/Birthday/commandsListener.ts

import { Client, Interaction, Events, CommandInteraction} from 'discord.js';
import Database from '@helpers/database';
import { Logging } from '@helpers/logging';

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
			// @ts-ignore
			const subCommandName: any = interaction.options.getSubcommand();
			
			if (commandName !== 'verjaardag') return;
			
			switch (subCommandName) {
				case 'toevoegen':
					void this.birthdayAdd(interaction);
					break;
				case 'verwijderen':
					void this.birthdayRemove(interaction);
					break;
				case 'lijst':
					void this.birthdayList(interaction);
					break;
			}
		});
	}
	
	async birthdayAdd(interaction: Interaction): Promise<void> {
		if (!interaction.isCommand()) return;
		
		Logging.info('Adding a birthday');
		await interaction.reply('Yeeet');
	}
	
	async birthdayRemove(interaction: Interaction): Promise<void> {
		if (!interaction.isCommand()) return;
		
		Logging.info('Deleted a birthday');
		await interaction.reply('Yeeet2');
	}
	
	async birthdayList(interaction: Interaction): Promise<void> {
		if (!interaction.isCommand()) return;
		
		Logging.info('Showing birthday list');
		await interaction.reply('Yeeet3');
		
	}
}