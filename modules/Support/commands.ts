import { SlashCommandBuilder } from 'discord.js';

export const commands = [
    new SlashCommandBuilder()
        .setName('support')
        .setDescription('Alle commands voor support vragen')
        // Close tech support
        .addSubcommand(subcommand =>
            subcommand
                .setName('opgelost')
                .setDescription('Zet een tech support thread op opgelost!')
        )
].map(commands => commands.toJSON());
