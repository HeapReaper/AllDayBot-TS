import {
    Client,
    Interaction,
    Events as discordEvents,
    ChatInputCommandInteraction,
    CommandInteractionOptionResolver,
    EmbedBuilder,
} from 'discord.js';
import { Color } from '@enums/colorEnum';
import { getEnv } from '@utils/env';
import { Github } from '@utils/github';
import S3OperationBuilder from '@utils/s3';
import QueryBuilder from '@utils/database';
import { JsonHelper } from '@utils/json';
import path from 'path';
import { Logging } from '@utils/logging';

export default class CommandsListener {
	private client: Client;

	constructor(client: Client) {
        this.client = client;
		void this.commandsListener();
	}
	
    async commandsListener(): Promise<void> {
        this.client.on(discordEvents.InteractionCreate, async (interaction: Interaction): Promise<void> => {
            if (!interaction.isCommand()) return;

            const { commandName } = interaction;

            if (commandName !== 'core') return;

            const subcommand = (interaction.options as CommandInteractionOptionResolver).getSubcommand();

            switch (subcommand) {
                case 'status':
                    await this.handleStatus(interaction as ChatInputCommandInteraction);
                    break;
            }
        });
    }

    async handleStatus(interaction: ChatInputCommandInteraction): Promise<void> {
        try {
            const s3Status = await S3OperationBuilder
                .setBucket(<string>getEnv('S3_BUCKET_NAME'))
                .status();

            const dbStatus = await QueryBuilder.status();

            const loadedModules = await JsonHelper
                .file(path.join(<string>getEnv('MODULES_BASE_PATH'), 'modules.json'))
                .read();

            const loadedModulesStr = Object.entries(loadedModules)
                .filter(([_, v]) => v)
                .map(([k]) => k)
                .join(', ');

            const currentRelease: string | null = await Github.getCurrentRelease();

            const embed: EmbedBuilder = new EmbedBuilder()
                .setTitle('Mijn status (en die van mijn services)')
                .setDescription('WIP')
                .setColor(Color.AdtgPurple)
                .addFields(
                    { name: 'Discord' , value: `Ping: ${this.client.ws.ping}ms`},
                    { name: 'Database', value: `Status: ${dbStatus.up ? 'Online' : 'Offline'} | Latency: ${dbStatus.latency}ms`, inline: true},
                    { name: 'S3', value: `Status: ${s3Status.up ? 'Online' : 'Offline'} | Latency: ${s3Status.latency}ms`, inline: true},
                    //{ name: 'Coolify', value: `wip`},
                    { name: 'Geladen modules:', value: `${loadedModulesStr}`},
                    { name: 'Huidige omgeving:', value: `${<string>getEnv('ENVIRONMENT')}`, inline: true},
                    { name: 'Huidige versie:', value: `${currentRelease ? currentRelease : 'Rate limited'}`, inline: true}
                )

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({content: 'Er ging wat mis!'});
        }
    }
}
