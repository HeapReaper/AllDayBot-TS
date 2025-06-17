import { SlashCommandBuilder } from 'discord.js';

/**
 * Subcommand to add a birthday
 * @example
 * /verjaardag toevoegen dag:12 maand:6 jaar:1999
 * @param integer dag - The day of your birthday
 * @param integer maand - The month of your birthday
 * @param integer jaar - Your birth year
 */
export const verjaardagToevoegenCommand = new SlashCommandBuilder()
    .setName('toevoegen')
    .setDescription('Voeg je verjaardag toe!')
    .addIntegerOption(option =>
        option
            .setName('dag')
            .setDescription('Kies de dag van je verjaardag.')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(31)
    )
    .addIntegerOption(option =>
        option
            .setName('maand')
            .setDescription('Kies de maand van je verjaardag.')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(12)
    )
    .addIntegerOption(option =>
        option
            .setName('jaar')
            .setDescription('Vul je geboortejaar in (zoals 2001 of 1992).')
            .setRequired(true)
    );

/**
 * Subcommand to remove a birthday
 * @example
 * /verjaardag verwijderen
 */
export const verjaardagVerwijderenCommand = new SlashCommandBuilder()
    .setName('verwijderen')
    .setDescription('Verwijder je verjaardag!');

/**
 * Main verjaardag command with subcommands.
 */
export const verjaardagCommand = new SlashCommandBuilder()
    .setName('verjaardag')
    .setDescription('Beheer je verjaardag!')
    .addSubcommand(sub =>
        sub
            .setName(verjaardagToevoegenCommand.name)
            .setDescription(verjaardagToevoegenCommand.description!)
            .addIntegerOption(o => Object.assign(o, verjaardagToevoegenCommand.options[0]))
            .addIntegerOption(o => Object.assign(o, verjaardagToevoegenCommand.options[1]))
            .addIntegerOption(o => Object.assign(o, verjaardagToevoegenCommand.options[2]))
    )
    .addSubcommand(sub =>
        sub
            .setName(verjaardagVerwijderenCommand.name)
            .setDescription(verjaardagVerwijderenCommand.description!)
    );

/**
 * Slash commands for the Verjaardag module.
 */
export const commands = [verjaardagCommand.toJSON()];