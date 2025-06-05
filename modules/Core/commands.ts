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
].map(commands => commands.toJSON());
