import { SlashCommandBuilder } from 'discord.js';

export const commands = [
    new SlashCommandBuilder()
        .setName('invites')
        .setDescription('De invite tracker')
        // List
        .addSubcommand(subcommand =>
            subcommand
                .setName('lijst')
                .setDescription('Lijst van de invite trackers')
        )
        // Add
        .addSubcommand(subcommand =>
            subcommand
                .setName('toevoegen')
                .setDescription('Voeg een invite toe aan de tracker')
                .addStringOption(option =>
                    option
                        .setName('naam')
                        .setDescription('De naam van de invite tracker')
                        .setRequired(true)
                )
                .addUserOption(option =>
                    option
                        .setName('invite_eigenaar')
                        .setDescription('De eigenaar van de invite link')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('invite_code')
                        .setDescription('Invite code')
                        .setRequired(true)
                )
        )
        // Delete
        .addSubcommand(subcommand =>
            subcommand
                .setName('verwijder')
                .setDescription('Verwijder een entry van de invite tracker per id, invite_code of invite naam')
                .addIntegerOption(option =>
                    option
                        .setName('id')
                        .setDescription('Invite ID')
                )
                .addStringOption(option =>
                    option
                        .setName('code')
                        .setDescription('Invite code (url)')
                )
                .addStringOption(option =>
                    option
                        .setName('invite_naam')
                        .setDescription('Invite naam')
                )
        ),
].map(command => command.toJSON());