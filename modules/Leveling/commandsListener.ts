import {ChatInputCommandInteraction, Client, Interaction} from 'discord.js';
import { Logging } from '@helpers/logging.ts';
import QueryBuilder from '@helpers/database';
import { CanvasBuilder } from '@helpers/canvasBuilder';
import path from 'path';

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
            // @ts-ignore
            const subCommandName: any = interaction.options.getSubcommand();

            switch (subCommandName) {
                case 'scorebord':
                    await this.handleScoreBoard(interaction as ChatInputCommandInteraction);
                    break;
                case 'huidig':
                    await this.handleLevel(interaction as ChatInputCommandInteraction);
                    break;
                case 'bereken_level':
                    await this.handleCalculateLevel(interaction as ChatInputCommandInteraction);
                    break;
            }
        });
    }

    async handleScoreBoard(interaction: ChatInputCommandInteraction): Promise<void> {
        try {
            const users: any[] = await QueryBuilder
                .select('leveling')
                .execute();

            let canvasHeight: number = 150;
            let canvasWidth: number = 225;

            for (const user of users) {
                canvasHeight += 25;

                const userObject = await this.client.users.fetch(user.user_id);
                if (userObject.displayName.length > 10) {
                    canvasWidth += (userObject.displayName.length - 4) * 5;
                }
            }

            const builder = new CanvasBuilder(canvasWidth, canvasHeight);

            await builder.setBackground();

            const textColor = '#ffffff';
            const titleFont = 'bold 20px sans-serif';
            const userNameFont = 'bold 15px sans-serif';
            const descriptionFont = '16px sans-serif';
            const smallDescriptionFont = '14px sans-serif';

            builder.drawText('XP scorebord', 20, 30, titleFont, textColor);
            builder.drawText('Pagina 1 van de 10', 20, 50, smallDescriptionFont, textColor);

            let userY: number = 80;
            let loopIndex: number = 1;
            for (const user of users) {
                try {
                    const userObject = await this.client.users.fetch(user.user_id);

                    builder.drawText(`#${loopIndex} - ${userObject.displayName}`, 20, userY, userNameFont, textColor);
                } catch (error) {
                    builder.drawText(`#1 - Onbekend`, 20, userY, userNameFont, textColor);
                }

                builder.drawText(`Level: ${user.level}`, 20, userY + 20, smallDescriptionFont, textColor);
                builder.drawText(`XP:     ${user.xp}`, 20, userY + 35, smallDescriptionFont, textColor);

                userY += 60;
                loopIndex++;
            }

            await interaction.reply({files: [builder.getBuffer()]})
        } catch (error) {
            Logging.error(`Something went wrong getting leveling scoreboard: ${error}`);
            // @ts-ignore
            await interaction.reply('Er ging iets mis! Het probleem is gerapporteerd aan de developer.');
        }
    }

    async handleLevel(interaction: ChatInputCommandInteraction): Promise<void> {
        const user: any = await QueryBuilder
            .select('leveling')
            .where({user_id: interaction.user.id})
            .first();

        await interaction.reply('Still some stuff to do...');
    }

    async handleCalculateLevel(interaction: ChatInputCommandInteraction): Promise<void> {

    }

    async createLevelCanvas(width: number, height: number) {
        //
    }
}