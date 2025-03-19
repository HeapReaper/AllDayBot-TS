// modules/Birthday/commands.ts

import { SlashCommandBuilder } from 'discord.js';
import { RefreshSlashCommands } from '@helpers/refreshSlashCommands.ts';

export default class Commands {
	constructor() {
		// @ts-ignore
		void this.setupSlashCommands();
	}
	
	async setupSlashCommands(): Promise<void> {
		const commands: any[] = [
			new SlashCommandBuilder()
				.setName('verjaardag')
				.setDescription('Beheer je verjaardag!')
				.addSubcommand(add =>
					add
						.setName('toevoegen')
					    .setDescription('Voeg je verjaardag toe!')
				)
				.addSubcommand(remove =>
					remove
						.setName('verwijder')
						.setDescription('Verwijder je verjaardag!')
				)
		];
		
		await RefreshSlashCommands.refresh(commands);
	}
}
