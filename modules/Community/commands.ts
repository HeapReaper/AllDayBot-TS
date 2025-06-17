import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

/**
 * Subcommand for sending a "niet om te vragen" embed.
 * @example
 * /community vraag
 * @param User gebruiker
 */
export const askCommand = new SlashCommandBuilder()
    .setName('vraag')
    .setDescription('Stuur een vraag niet om te vragen embed')
    .addMentionableOption(option =>
        option
            .setName('gebruiker')
            .setDescription('Selecteer de gebruiker')
            .setRequired(true)
    );

/**
 * Subcommand for sending a "dat hoeft niet in DM" embed.
 * @param User gebruiker
 */
export const dmCommand = new SlashCommandBuilder()
    .setName('dm')
    .setDescription('Stuur een dat hoeft niet in DM embed')
    .addMentionableOption(option =>
        option
            .setName('gebruiker')
            .setDescription('Selecteer de gebruiker')
            .setRequired(true)
    );

/**
 * Subcommand for sending a "doe niet zo moeilijk" embed.
 * @param User gebruiker
 */
export const dohardCommand = new SlashCommandBuilder()
    .setName('moeilijk_doen')
    .setDescription('Stuur een doe niet zo moeilijk embed')
    .addMentionableOption(option =>
        option
            .setName('gebruiker')
            .setDescription('Selecteer de gebruiker')
            .setRequired(true)
    );

/**
 * Subcommand for sending a "verkeerd kanaal" embed to a specific user and channel.
 * @param User gebruiker
 * @param Channel kanaal
 */
export const channelCommand = new SlashCommandBuilder()
    .setName('kanaal')
    .setDescription('Stuur een verkeerd kanaal embed')
    .addMentionableOption(option =>
        option
            .setName('gebruiker')
            .setDescription('Selecteer de gebruiker')
            .setRequired(true)
    )
    .addChannelOption(option =>
        option
            .setName('kanaal')
            .setDescription('Selecteer het kanaal waarin de embed gestuurd moet worden')
            .setRequired(true)
    );

/**
 * The main community command, grouping all community-related subcommands.
 */
export const communityCommand = new SlashCommandBuilder()
    .setName('community')
    .setDescription('Alle community commands')
    .addSubcommand(sub => sub.setName('vraag').setDescription(askCommand.description!))
    .addSubcommand(sub => sub.setName('dm').setDescription(dmCommand.description!))
    .addSubcommand(sub => sub.setName('moeilijk_doen').setDescription(dohardCommand.description!))
    .addSubcommand(sub => sub.setName('kanaal').setDescription(channelCommand.description!));

/**
 * Slash commands for the Community module.
 */
export const commands = [communityCommand.toJSON()];