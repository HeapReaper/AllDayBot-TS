import { SlashCommandBuilder } from 'discord.js';

export const commands = [
	new SlashCommandBuilder()
		.setName('minecraft')
		.setDescription('Minecraft functies!')
		.addSubcommand(add =>
			add
			.setName('whitelist')
			.setDescription('Krijg toegang tot onze Minecraft servers!')
			.addStringOption(option =>
				option
					.setName('gebruikersnaam')
					.setDescription('Gebruikers naam van Minecraft.')
					.setRequired(true)
			)
		)
		.addSubcommand(add =>
			add
				.setName('verwijder_whitelist')
				.setDescription('Verwijder je whitelist van onze bot.')
			
		)
].map(commands => commands.toJSON());
