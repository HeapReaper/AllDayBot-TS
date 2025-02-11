// modules/Leveling/commands.js

import { Logging } from '@helpers/logging';
import { SlashCommandBuilder } from '@discordjs/builders';
import { RefreshSlashCommands } from '@helpers/refreshSlashCommands';

export default class LevelingCommands {
    constructor() {
        this.setupCommands()
            .then((): void => {Logging.info('Leveling...')})
            .catch((err: Error): void => {Logging.error(err.message)});
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
