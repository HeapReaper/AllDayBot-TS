// modules/Birthday/commands.ts

import { SlashCommandBuilder } from 'discord.js';

export const commands = [
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
].map(commands => commands.toJSON());