import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

/**
 * Subcommand to show status
 * @example
 * /core status
 */
export const coreStatusCommand = new SlashCommandBuilder()
    .setName('status')
    .setDescription('Zie alle info en statussen');

/**
 * Subcommand to restart the bot
 * @param boolean bevestig - Confirm action
 * @example
 * /core restart bevestig:true
 */
export const coreRestartCommand = new SlashCommandBuilder()
    .setName('restart')
    .setDescription('Herstart de Discord bot')
    .addBooleanOption(option =>
        option
            .setName('bevestig')
            .setDescription('Bevestig')
            .setRequired(true)
    );

/**
 * Subcommand to refresh slash commands
 * @param boolean bevestig - Confirm action
 * @example
 * /core slash_refresh bevestig:true
 */
export const coreSlashRefreshCommand = new SlashCommandBuilder()
    .setName('slash_refresh')
    .setDescription('Ververs de slash commands')
    .addBooleanOption(option =>
        option
            .setName('bevestig')
            .setDescription('Bevestig')
            .setRequired(true)
    );

/**
 * Subcommand to toggle modules
 * @param string module - The module to toggle
 * @param boolean aan_uit - Turning it on/off
 * @example
 * /core modules module:Birthday aan_uit:true
 */
export const coreModulesCommand = new SlashCommandBuilder()
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
                { name: 'ShowcaseRemover', value: 'ShowcaseRemover' }
            )
    )
    .addBooleanOption(option =>
        option
            .setName('aan_uit')
            .setDescription('Zet module aan of uit')
    );

/**
 * Main core command with subcommands.
 */
export const coreCommand = new SlashCommandBuilder()
    .setName('core')
    .setDescription('Beheer de bot')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
        sub
            .setName(coreStatusCommand.name)
            .setDescription(coreStatusCommand.description!)
    )
    .addSubcommand(sub =>
        sub
            .setName(coreRestartCommand.name)
            .setDescription(coreRestartCommand.description!)
            .addBooleanOption(o => Object.assign(o, coreRestartCommand.options[0]))
    )
    .addSubcommand(sub =>
        sub
            .setName(coreSlashRefreshCommand.name)
            .setDescription(coreSlashRefreshCommand.description!)
            .addBooleanOption(o => Object.assign(o, coreSlashRefreshCommand.options[0]))
    )
    .addSubcommand(sub =>
        sub
            .setName(coreModulesCommand.name)
            .setDescription(coreModulesCommand.description!)
            .addStringOption(o => Object.assign(o, coreModulesCommand.options[0]))
            .addBooleanOption(o => Object.assign(o, coreModulesCommand.options[1]))
    );

/**
 * Slash commands for the Core module.
 */
export const commands = [coreCommand.toJSON()];
