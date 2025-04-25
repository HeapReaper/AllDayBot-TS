import { SlashCommandBuilder } from 'discord.js';

export const commands = [
    new SlashCommandBuilder()
        .setName('community')
        .setDescription('Alle community commands')
        .addSubcommand(add =>
            add
            .setName('vraag')
            .setDescription('Stuur een vraag niet om te vragen embed')
            .addMentionableOption(option =>
                option
                .setName('gebruiker')
                .setDescription('Selecteer de gebruiker')
                .setRequired(true)
            )
        )
        .addSubcommand(add =>
            add
            .setName('dm')
            .setDescription('Stuur een dat hoeft niet in DM embed')
            .addMentionableOption(option =>
                option
                .setName('gebruiker')
                .setDescription('Selecteer de gebruiker')
                .setRequired(true)
            )
        )
        .addSubcommand(add =>
            add
            .setName('moeilijk_doen')
            .setDescription('Stuur een doe niet zo moeilijk embed')
            .addMentionableOption(option =>
                option
                .setName('gebruiker')
                .setDescription('Selecteer de gebruiker')
                .setRequired(true)
            )
        )
        .addSubcommand(add =>
            add
            .setName('kanaal')
            .setDescription('Stuur een verkeerd kanaal embed')
            .addMentionableOption(option =>
                option
                .setName('gebruiker')
                .setDescription('Selecteer de gebruiker')
                .setRequired(true)
            )
        )
].map(commands => commands.toJSON());
