import { Client, Interaction } from 'discord.js';
import { Logging } from '@helpers/logging.ts';
import Database from '@helpers/database';
import CanvasBuilder from '@helpers/canvasBuilder.ts';
import { Color } from '@enums/colorEnum.ts';

export default class CommandsListener {
    private client: Client;

    constructor(client: Client) {
        this.client = client;
        void this.commandListener()
    }

    async commandListener(): Promise<void> {
        this.client.on('interactionCreate', async (interaction: Interaction): Promise<void> => {
            if (!interaction.isCommand()) return;

            const { commandName } = interaction;
            const subCommandName: any = interaction.options.getSubcommand();

            switch (subCommandName) {
                case 'scorebord':
                    await this.handleScoreBoard(interaction);
                    break;
                case 'level':
                    await this.handleLevel(interaction);
                    break;
                case 'bereken_level':
                    await this.handleCalculateLevel(interaction);
                    break;
            }
        });
    }

    async handleScoreBoard(interaction: Interaction): Promise<void> {
        //
    }

    async handleLevel(interaction: Interaction): Promise<void> {
        //
    }

    async handleCalculateLevel(interaction: Interaction): Promise<void> {

    }

    createLevelEmbed() {

    }
}