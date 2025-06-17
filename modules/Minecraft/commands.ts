import { SlashCommandBuilder } from 'discord.js';

/**
 * Subcommand: Add yourself to the Minecraft whitelist
 * @param {string} gebruikersnaam - Your Minecraft username
 * @example
 * /minecraft whitelist gebruikersnaam:Notch
 */
export const whitelistCommand = new SlashCommandBuilder()
	.setName('whitelist')
	.setDescription('Krijg toegang tot onze Minecraft servers!')
	.addStringOption(option =>
		option
			.setName('gebruikersnaam')
			.setDescription('Gebruikers naam van Minecraft.')
			.setRequired(true)
	);

/**
 * Subcommand: Remove yourself for the whitelist
 * @example
 * /minecraft verwijder_whitelist
 */
export const verwijderWhitelistCommand = new SlashCommandBuilder()
	.setName('verwijder_whitelist')
	.setDescription('Verwijder je whitelist van onze bot.');

/**
 * Subcommand: See who's online on the Minecraft servers
 * @example
 * /minecraft online
 */
export const onlineCommand = new SlashCommandBuilder()
	.setName('online')
	.setDescription('Zie wie online is!');

export const minecraftCommand = new SlashCommandBuilder()
	.setName('minecraft')
	.setDescription('Minecraft functies!')
	.addSubcommand(sub =>
		sub.setName('whitelist').setDescription(whitelistCommand.description!)
	)
	.addSubcommand(sub =>
		sub.setName('verwijder_whitelist').setDescription(verwijderWhitelistCommand.description!)
	)
	.addSubcommand(sub =>
		sub.setName('online').setDescription(onlineCommand.description!)
	);

export const commands = [minecraftCommand.toJSON()];