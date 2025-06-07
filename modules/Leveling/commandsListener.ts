import {
    ChatInputCommandInteraction,
    Client,
    Interaction,
    Events as discordEvents,
    Guild,
    User
} from 'discord.js';
import { Logging } from '@utils/logging.ts';
import QueryBuilder from '@utils/database';
import { CanvasBuilder } from '@utils/canvasBuilder';
import { getEnv } from "@utils/env.ts";

export default class CommandsListener {
    private client: Client;

    constructor(client: Client) {
        this.client = client;
        void this.commandListener()
    }

    async commandListener(): Promise<void> {
        this.client.on(discordEvents.InteractionCreate, async (interaction: Interaction): Promise<void> => {
            if (!interaction.isChatInputCommand()) return;

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
            const page = interaction.options.getInteger('pagina') as number ?? 1;

            const users: any[] = await QueryBuilder
                .select('leveling')
                .limit(10)
                .offset((page - 1) * 10)
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

            await builder.setBackground('src/media/bg_banner.jpg');

            const textColor = '#ffffff';
            const titleFont = 'bold 20px sans-serif';
            const userNameFont = 'bold 15px sans-serif';
            const descriptionFont = '16px sans-serif';
            const smallDescriptionFont = '14px sans-serif';

            builder.drawText('XP scorebord', 20, 30, titleFont, textColor);
            builder.drawText(`Pagina ${page}`, 20, 50, smallDescriptionFont, textColor);

            let userY: number = 80;
            let loopIndex: number = 1;
            for (const user of users) {
                try {
                    const userObject: User | null = await this.client.users.fetch(user.user_id);
                    builder.drawText(`#${loopIndex} - ${userObject.displayName}`, 20, userY, userNameFont, textColor);
                } catch (error) {
                    console.warn(`User with ID ${user.user_id} could not be fetched.`);
                    builder.drawText(`#${loopIndex} - Onbekend`, 20, userY, userNameFont, textColor);
                }



                builder.drawText(`Level: ${user.level}`, 20, userY + 20, smallDescriptionFont, textColor);
                builder.drawText(`XP:     ${user.xp}`, 20, userY + 35, smallDescriptionFont, textColor);

                userY += 60;
                loopIndex++;
            }

            await interaction.reply({files: [builder.getBuffer()]})
        } catch (error) {
            Logging.error(`Something went wrong getting leveling scoreboard: ${error}`);
            await interaction.reply('Er ging iets mis! Het probleem is gerapporteerd aan de developer.');
        }
    }

    async handleLevel(interaction: ChatInputCommandInteraction): Promise<void> {
        const user: any = await QueryBuilder
            .select('leveling')
            .where({user_id: interaction.user.id})
            .first();

        const guild: Guild  = await this.client.guilds.fetch(<string>getEnv('GUILD_ID'));
        const member = await guild.members.fetch(interaction.user.id);

        console.log(member.displayAvatarURL())

        await interaction.reply('Still some stuff to do...');
    }

    async handleCalculateLevel(interaction: ChatInputCommandInteraction): Promise<void> {

    }

    async createLevelCanvas(width: number, height: number) {
        //
    }
}