// modules/Leveling/commands.js

import { config } from 'dotenv';
config();

import { Logging } from '../../helpers/logging';
import { REST } from '@discordjs/rest';
import { SlashCommandBuilder } from '@discordjs/builders';
import { Routes } from 'discord-api-types/v9';

class LevelingCommands {
    constructor() {
        this.init()
            .then((): void => {Logging.info('Leveling...')})
            .catch((err: Error): void => {Logging.error(err.message)});
    }

    private async init(): Promise<void> {
        await this.setupCommands();
    }

    private async setupCommands(): Promise<void> {
        const commands = [
            new SlashCommandBuilder()
                .setName('scorebord')
                .setDescription('Bekijk de level scorebord!'),
            new SlashCommandBuilder()
                .setName('level')
                .setDescription('Level scorebord!')
        ].map(commands => commands.toJSON());

        const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN!);
        await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID!, process.env.GUILD_ID!), {
            body: commands,
        });
    }
}

export default function (): void {
    new LevelingCommands();
}