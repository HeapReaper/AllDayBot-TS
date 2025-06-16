import {
    SlashCommandBuilder,
    PermissionFlagsBits,
} from 'discord.js';

/**
 * Command to view the status of the bot.
 * @example
 * /core status
 */
export const statusCommand = new SlashCommandBuilder()
    .setName('status')
    .setDescription('Zie alle info en statussen');

/**
 * Command to restart the bot.
 * @example
 * /core restart
 * @param boolean bevestig
 */
export const restartCommand = new SlashCommandBuilder()
    .setName('restart')
    .setDescription('Herstart de Discord bot')
    .addBooleanOption(option =>
        option
            .setName('bevestig')
            .setDescription('Bevestig')
            .setRequired(true)
    );

/**
 * Command to refresh slash commands.
 * @example
 * /core slash_refresh
 * @param boolean bevestig
 */
export const slashRefreshCommand = new SlashCommandBuilder()
    .setName('slash_refresh')
    .setDescription('Ververs de slash commands')
    .addBooleanOption(option =>
        option
            .setName('bevestig')
            .setDescription('Bevestig')
            .setRequired(true)
    );

/**
 * Command to enable or disable modules.
 * @example
 * /core modules
 * @param string module
 * @param string aan_uit
 */
export const modulesCommand = new SlashCommandBuilder()
    .setName('modules')
    .setDescription('Zet modules aan of uit')
    .addStringOption(option =>
        option
            .setName('module')
            .setDescription('Welke module?')
            .addChoices(
                { name: 'Birthday', value: 'Birthday' },
                { name: 'BumpReminder', value: 'BumpReminder' },
                { name: 'Community', value: 'Community' },
                { name: 'Core', value: 'Core' },
                { name: 'InviteTracker', value: 'InviteTracker' },
                { name: 'Leveling', value: 'Leveling' },
                { name: 'Minecraft', value: 'Minecraft' },
                { name: 'ModMail', value: 'ModMail' },
                { name: 'ServerLogger', value: 'ServerLogger' },
                { name: 'ShowcaseRemover', value: 'ShowcaseRemover' }, // fixed typo
            )
    )
    .addBooleanOption(option =>
        option
            .setName('aan_uit')
            .setDescription('Zet module aan of uit')
    );

/**
 * Core command with all subcommands.
 */
export const coreCommand = new SlashCommandBuilder()
    .setName('core')
    .setDescription('Beheer de bot')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub => sub.setName('status').setDescription(statusCommand.description!))
    .addSubcommand(sub => sub.setName('restart').setDescription(restartCommand.description!))
    .addSubcommand(sub => sub.setName('slash_refresh').setDescription(slashRefreshCommand.description!))
    .addSubcommand(sub => sub.setName('modules').setDescription(modulesCommand.description!));

/**
 * Slash commands for the Core module.
 */
export const commands = [coreCommand.toJSON()];
