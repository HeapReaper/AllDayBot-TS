// modules/Birthday/commands.ts

import { SlashCommandBuilder } from 'discord.js';
import { RefreshSlashCommands } from '@helpers/refreshSlashCommands.ts';
import { Logging } from '@helpers/logging';

export default class Commands {
	constructor() {
		// @ts-ignore
		void this.setupSlashCommands();
	}
	
	async setupSlashCommands(): Promise<void> {
	
	}
}
