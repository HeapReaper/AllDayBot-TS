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
import * as process from "node:process";

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
        const os = await import('node:os');
        const usage = process.resourceUsage();
        const uptimeInSeconds = process.uptime();
        const memory = process.memoryUsage();
        const cpu = process.cpuUsage();

        const [load1, load5, load15] = os.loadavg();
        const cpuCount: number = os.cpus().length;
        const toPercent = (load: number) => ((load / cpuCount) * 100).toFixed(2);

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

            const lastRanMigration = await QueryBuilder
                .select('migrations')
                .columns(['name'])
                .orderBy('name', 'DESC')
                .limit(1)
                .first();

            const embed: EmbedBuilder = new EmbedBuilder()
                .setTitle('Mijn status')
                .setDescription('En die van mijn services')
                .setColor(Color.AdtgPurple)
                .addFields(
                    {
                        name: 'CPU',
                        value: ` \`\`\`1m: ${toPercent(load1)}%, 5m: ${toPercent(load5)}%, 15m: ${toPercent(load15)}%\`\`\` `
                    },
                    {
                        name:'RAM',
                        value: ` \`\`\`Allocated: ${(memory.rss / 1024 / 1024).toFixed(2)}MB \nHeap total: ${(memory.heapTotal / 1024 / 1024).toFixed(2)}MB\nHeap used: ${(memory.heapUsed / 1024 / 1024).toFixed(2)}MB\`\`\` `
                    },
                    {
                        name: 'Geladen modules:',
                        value: ` \`\`\`${loadedModulesStr}\`\`\` `
                    },
                    {
                        name: 'Discord',
                        value: `Ping: \`${this.client.ws.ping}ms\``
                    },
                    {
                        name: 'Database',
                        value: `Status: ${dbStatus.up ? '✅' : '❌'} | Ping: \`${dbStatus.latency}ms\``,
                        inline: true
                    },
                    {
                        name: 'Laatste migratie',
                        value: ` \`${lastRanMigration['name']}\` `,
                        inline: true
                    },
                    {
                        name: 'S3',
                        value: `Status: ${s3Status.up ? '✅' : '❌'} | Ping: \`${s3Status.latency}ms\``,
                        inline: false
                    },
                    {
                        name: 'Huidige omgeving',
                        value: ` \`${<string>getEnv('ENVIRONMENT')}\` `,
                        inline: true
                    },
                    {
                        name: 'Bot versie',
                        value: ` \`${currentRelease ? currentRelease : 'Rate limited'}\` `,
                        inline: true
                    },
                    {
                        name: 'Bun versie',
                        value: ` \`${Bun.version}\` `,
                        inline: true
                    }
                )

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.log(error);
            await interaction.reply({ content: 'Er ging wat mis!' });
        }
    }
}
