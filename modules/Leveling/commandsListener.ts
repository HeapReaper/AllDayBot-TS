// modules/Leveling/commandsListener

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

            switch (commandName) {
                case 'scorebord':
                    await this.handleScoreBoardCommand(interaction);
                    break;
                case 'level':
                    await this.handleLevelCommand(interaction);
                    break;
            }
        });
    }

    async handleScoreBoardCommand(interaction: Interaction): Promise<void> {
        const canvasScorebord = new CanvasBuilder(250, 400);

        await canvasScorebord.setBackground('https://img.freepik.com/free-vector/dark-hexagonal-background-with-gradient-color_79603-1409.jpg');
        canvasScorebord.drawRect(0, 0, 250, 50, Color.Opacity50);
        canvasScorebord.drawText('Scorebord', 22, 30, 'bold 24px Arial', Color.White)
        Database.connect();
        const LeaderBoardData = await Database.query('SELECT user_id, xp, level FROM leveling');
        for (const [index, entry] of LeaderBoardData.entries()) {
            try {
                const user = await this.client.users.fetch(entry.user_id);
                canvasScorebord.drawText(`${index + 1}.  ${user.displayName}`, 20, 80 + index * 33, 'bold 16px Arial', Color.White);
                canvasScorebord.drawText(`Level: ${entry.level}, XP: ${entry.xp}`, 40, 80 + index * 33, 'bold 14px Arial', Color.White);
            } catch (error: any) {
                Logging.error(`Error fetching user: ${entry.user_id} - ${error.message}`);
                canvasScorebord.drawText(`${index + 1}.  Onbekend`, 20, 80 + index * 33, 'bold 16px Arial', Color.White);
                canvasScorebord.drawText(`Level: ${entry.level}, XP: ${entry.xp}`, 40, 80 + index * 33, 'bold 14px Arial', Color.White);
            }
        }

        canvasScorebord.drawText('Pagina: 1', 20, 390, '10px Arial', Color.White);

        const attachment = canvasScorebord.getBuffer();
        // @ts-ignore
        await interaction.reply({ files: [{ attachment, name: 'leaderboard.png' }] });
    }

    async handleLevelCommand(interaction: Interaction): Promise<void> {
        //const userLevelData = await Database.query(`SELECT xp, level FROM leveling WHERE user_id = ${interaction.user.id}`);

        const canvasLevel = new CanvasBuilder(400, 250);
        await canvasLevel.setBackground('https://img.freepik.com/free-vector/dark-hexagonal-background-with-gradient-color_79603-1409.jpg');

        canvasLevel.drawRect(0, 0, 400, 50, Color.Opacity50);
        canvasLevel.drawText(`🔥 Level van ${interaction.user.displayName} 🔥`, 46, 33, 'bold 24px Arial', Color.White);

        const attachment = canvasLevel.getBuffer();
        // @ts-ignore
        await interaction.reply({ files: [{ attachment, name: 'userLevel.png' }] });
    }
}