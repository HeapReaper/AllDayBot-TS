import { SlashCommandBuilder } from 'discord.js';

export const commands = [
    new SlashCommandBuilder()
        .setName('level')
        .setDescription('De commands voor onze level systeem!')
        .addSubcommand(add =>
            add
            .setName('scorebord')
            .setDescription('Zie onze scorebord!')
            .addIntegerOption(option =>
                option
                .setName('pagina')
                .setDescription('Ga naar een specifieke pagina')
                .setRequired(true)
            ),
        )
        .addSubcommand(add =>
            add
            .setName('huidig')
            .setDescription('Zie je huidige level')
        )
        .addSubcommand(add =>
            add
            .setName('bereken_level')
            .setDescription('Bereken het benodigde XP je level')
            .addIntegerOption(option =>
                option
                .setName('level')
                .setDescription('Vul je level in')
                .setRequired(true)
            ),
        )
].map(command => command.toJSON());
