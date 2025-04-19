import {Client, Events, GatewayIntentBits, Partials} from 'discord.js';
import {Logging} from '@helpers/logging.ts';
import * as Sentry from '@sentry/bun';
import loadModules from '@helpers/moduleLoader.ts';
import {getEnv} from '@helpers/env.ts';
import {runMigrations} from '@helpers/migrations.ts';

// @ts-ignore
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
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

client.on(Events.ClientReady, async client => {
    Logging.info(`Logged in as ${client.user.tag}!`);

    await loadModules(client);
    await runMigrations();

    if (getEnv('ENVIRONMENT') !== 'prod') return;
    Sentry.init({
        dsn: <string>getEnv('SENTRY_DSN'),
        tracesSampleRate: 1.0,
    });
});

client.login(<string>getEnv('DISCORD_TOKEN'));
