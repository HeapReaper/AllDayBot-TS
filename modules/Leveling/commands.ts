// modules/Leveling/commands.js

import { config } from 'dotenv';
config();

import { Logging } from '@helpers/logging';
import { SlashCommandBuilder } from '@discordjs/builders';
import { RefreshSlashCommands } from "@helpers/refreshSlashCommands";

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
                .setDescription('Zie je level!')
        ].map(commands => commands.toJSON());

        await RefreshSlashCommands.refresh(commands);
    }
}

export default function (): void {
    new LevelingCommands();
}