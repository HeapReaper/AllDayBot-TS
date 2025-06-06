import {
    SlashCommandBuilder,
    PermissionFlagsBits,
} from 'discord.js';

export const commands = [
    new SlashCommandBuilder()
        .setName('core')
        .setDescription('Beheer de bot')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(add =>
            add
            .setName('status')
            .setDescription('Zie alle info en statussen')
        )
        .addSubcommand(add =>
            add
            .setName('restart')
            .setDescription('Herstart de Discord bot')
            .addBooleanOption(option =>
                option
                .setName('bevestig')
                .setDescription('Bevestig')
                .setRequired(true)
            )
        )
        .addSubcommand(add =>
            add
            .setName('slash_refresh')
            .setDescription('Ververs de slash commands')
            .addBooleanOption(option =>
                option
                .setName('bevestig')
                .setDescription('Bevestig')
                .setRequired(true)
            )
        )
        .addSubcommand(add =>
            add
            .setName('modules')
            .setDescription('Zet modules aan of uit')
            .addStringOption(option =>
                option
                .setName('module')
                .setDescription('Welke module?')
                .addChoices( // TODO: Make dynamic
                    { name: 'Birthday', value: 'Birthday'},
                    { name: 'BumpReminder', value: 'BumpReminder'},
                    { name: 'Community', value: 'Community'},
                    { name: 'Core', value: 'Core'},
                    { name: 'InviteTracker', value: 'InviteTracker'},
                    { name: 'Leveling', value: 'Leveling'},
                    { name: 'Minecraft', value: 'Minecraft'},
                    { name: 'ModMail', value: 'ModMail'},
                    { name: 'ServerLogger', value: 'ServerLogger'},
                    { name: 'ShowcaseRemover', value: 'ShowcasRemover'},
                )
            )
            .addBooleanOption(option =>
                option
                .setName('aan_uit')
                .setDescription('Zet module aan of uit')
            )
        )
].map(commands => commands.toJSON());
