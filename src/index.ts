import { config } from 'dotenv';
import * as process from 'node:process';
config();

import { Client, Events, GatewayIntentBits } from 'discord.js';
import { Logging } from '../helpers/logging.ts';
import * as Sentry from '@sentry/bun';
import loadModules from '@helpers/moduleLoader.ts';

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.on(Events.ClientReady, async client   => {
    Logging.info(`Logged in as ${client.user.tag}!`);
    await loadModules(client);

    // Add Sentry listening if environment is prod
    if (process.env.ENVIRONMENT !== 'prod') return;
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        tracesSampleRate: 1.0,
    });
});

client.login(process.env.DISCORD_TOKEN);
