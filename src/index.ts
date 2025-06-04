import { Client, Events as discordEvents, GatewayIntentBits, Partials } from 'discord.js';
import { Logging } from '@utils/logging.ts';
import * as Sentry from '@sentry/bun';
import loadModules from '@utils/moduleLoader.ts';
import { getEnv } from '@utils/env.ts';
import { runMigrations } from '@utils/migrations.ts';
import QueryBuilder from '@utils/database.ts';
import cron from 'node-cron';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessageReactions,
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.Reaction
    ],
});

client.on(discordEvents.ClientReady, async client => {
    Logging.info(`Logged in as ${client.user.tag}!`);

    await loadModules(client);
    await runMigrations();

    cron.schedule('* * * * *', async (): Promise<void> => {
        Logging.debug('Running Cron select on DB to keep it active!');

        await QueryBuilder
            .select('migrations')
            .columns(['name'])
            .get()
    });

    if (getEnv('ENVIRONMENT') !== 'prod') return;
    Sentry.init({
        dsn: <string>getEnv('SENTRY_DSN'),
        tracesSampleRate: 1.0,
    });
});

void client.login(<string>getEnv('DISCORD_TOKEN'));
