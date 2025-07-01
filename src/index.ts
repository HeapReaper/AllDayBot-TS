import { Client, Events as discordEvents, GatewayIntentBits, Partials } from 'discord.js';
import { Logging } from '@utils/logging.ts';
import * as Sentry from '@sentry/bun';
import loadModules from '@utils/moduleLoader.ts';
import { getEnv } from '@utils/env.ts';
import { runMigrations } from '@utils/migrations.ts';
import QueryBuilder from '@utils/database.ts';
import cron from 'node-cron';
import { loadLocale, setLocale } from '@utils/i18n';

loadLocale('nl');
setLocale('nl');

/**
 * Discord client instance with required intents and partials.
 */
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

/**
 * Event listener that gets triggered once the Discord client is ready/
 * @event ClientReady
 * @param Client client
 */
client.on(discordEvents.ClientReady, async client => {
    Logging.info(`Logged in as ${client.user.tag}!`);

    /**
     * Runs all pending migrations
     */
    await runMigrations();

    /**
     * Load all dynamic modules into the bot
     */
    await loadModules(client);

    /**
     * Keep the database connection alive by running a dummy select every minute.*
     * @schedule Every minute
     */
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
