// modules/Leveling/commands.js

import { config } from 'dotenv';
config();

import { Logging } from '../../helpers/logging.js';
import { REST } from '@discordjs/rest';
import { SlashCommandBuilder } from '@discordjs/builders';
import { Routes } from 'discord-api-types/v9';
import { createCanvas, loadImage} from 'canvas';
import Database from "../../helpers/database.js";

class LevelingCommands {
    constructor(client) {
        this.client = client;
        this.setupScoreBoardCommand();
        this.setupLevelCommand();
        this.commandListener();
    }

    async setupScoreBoardCommand() {
        const commands = [
            new SlashCommandBuilder()
                .setName('scorebord')
                .setDescription('Bekijk de level scorebord!')
        ].map(command => command.toJSON())

        const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);
        await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), {
            body: commands,
        });
    }

    async setupLevelCommand() {
        const levelCommands = [
            new SlashCommandBuilder()
                .setName('level')
                .setDescription('Bekijk je level!')
        ].map(command => command.toJSON());

        const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);
        await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), {
            body: levelCommands,
        });
    }

    async commandListener() {
        this.client.on('interactionCreate', async (interaction) => {
            if (!interaction.isCommand()) return;
            const { commandName } = interaction;

            if (commandName === 'scorebord') {
                await this.handleScoreBoardCommand(interaction);
            }

            if (commandName === 'level') {
                await this.handleLevelCommand(interaction);
            }
        });
    }

    // level_calc

    async handleScoreBoardCommand(interaction) {
        const canvasScoreBoard = createCanvas(250, 400);
        const ctxScoreBoard = canvasScoreBoard.getContext('2d');

        const backgroundImage = await loadImage('https://img.freepik.com/free-vector/dark-hexagonal-background-with-gradient-color_79603-1409.jpg');
        ctxScoreBoard.drawImage(backgroundImage, 0, 0, 600, 800);

        ctxScoreBoard.fillStyle = 'rgb(0, 0, 0, 0.5)';
        ctxScoreBoard.fillRect(0, 0, 250, 50);

        ctxScoreBoard.fillStyle = '#ECF0F1';
        ctxScoreBoard.font = 'bold 24px Arial';
        ctxScoreBoard.fillText('🔥 Score bord 🔥', 22, 30);

        Database.connect();
        const LeaderBoardData = await Database.query('SELECT user_id, xp, level FROM leveling');
        for (const entry of LeaderBoardData) {
            const index = LeaderBoardData.indexOf(entry);
            try {
                const user = await this.client.users.fetch(entry.user_id);

                ctxScoreBoard.font = 'bold 16px Arial';
                ctxScoreBoard.fillText(`${index + 1}.  ${user.displayName}`, 20, 80 + index * 33);
                ctxScoreBoard.font = 'bold 14px Arial';
                ctxScoreBoard.fillText(`\nLevel: ${entry.level}, XP: ${entry.xp}`, 40, 80 + index * 33);
            } catch (error) {
                Logging.error(`Error fetching user: ${entry.user_id}`, error);
                ctxScoreBoard.font = 'bold 16px Arial';
                ctxScoreBoard.fillText(`${index + 1}.  Onbekend`, 20, 80 + index * 33);
                ctxScoreBoard.font = 'bold 14px Arial';
                ctxScoreBoard.fillText(`\nLevel: ${entry.level}, XP: ${entry.xp}`, 40, 80 + index * 33);
            }
        }

        ctxScoreBoard.font = '10px Arial';
        ctxScoreBoard.fillText('Pagina: 1', 20, 390);

        const attachment = canvasScoreBoard.toBuffer();
        await interaction.reply({ files: [{ attachment, name: 'leaderboard.png' }] });
    }

    async handleLevelCommand(interaction) {
        const userLevelData = await Database.query(`SELECT xp, level FROM leveling WHERE user_id = ${interaction.user.id}`);
        const canvasLevel = createCanvas(400, 250);
        const ctxLevel = canvasLevel.getContext('2d');
        const levelBackgroundImage = await loadImage('https://img.freepik.com/free-vector/dark-hexagonal-background-with-gradient-color_79603-1409.jpg');

        ctxLevel.drawImage(levelBackgroundImage, 0, 0, 800, 600);

        ctxLevel.fillStyle = 'rgb(0, 0, 0, 0.5)';
        ctxLevel.fillRect(0, 0, 400, 50);

        ctxLevel.fillStyle = '#ECF0F1';
        ctxLevel.font = 'bold 24px Arial';
        ctxLevel.fillText(`🔥 Level van ${interaction.user.displayName} 🔥`, 46, 33);

        const attachment = canvasLevel.toBuffer();
        await interaction.reply({ files: [{ attachment, name: 'userLevel.png' }] });
    }
}

export default function (client) {
    new LevelingCommands(client);
}