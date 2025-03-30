import { Client, Events, GatewayIntentBits } from 'discord.js';
import { Logging } from '@helpers/logging.ts';
import * as Sentry from '@sentry/bun';
import loadModules from '@helpers/moduleLoader.ts';
import { getEnv } from '@helpers/env.ts';

// @ts-ignore
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessageReactions,
    ]
});

client.on(Events.ClientReady, async client   => {
    Logging.info(`Logged in as ${client.user.tag}!`);
    await loadModules(client);

    // Add Sentry listening if environment is prod
    if (getEnv('ENVIRONMENT') !== 'prod') return;
    Sentry.init({
        dsn: getEnv('SENTRY_DSN'),
        tracesSampleRate: 1.0,
    });
});

client.login(getEnv('DISCORD_TOKEN'));
