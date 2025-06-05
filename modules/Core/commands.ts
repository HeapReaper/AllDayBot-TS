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
].map(commands => commands.toJSON());
