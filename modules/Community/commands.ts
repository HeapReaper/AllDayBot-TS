import { SlashCommandBuilder } from 'discord.js';

export const commands = [
    new SlashCommandBuilder()
        .setName('vraag_om_te_vragen')
].map(commands => commands.toJSON());
