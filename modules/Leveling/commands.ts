// modules/Leveling/commands.js

import { SlashCommandBuilder } from '@discordjs/builders';

export const commands = [
    new SlashCommandBuilder()
        .setName('scorebord')
        .setDescription('Bekijk de level scorebord!'),
    new SlashCommandBuilder()
        .setName('level')
        .setDescription('Zie je level!')
].map(commands => commands.toJSON());
