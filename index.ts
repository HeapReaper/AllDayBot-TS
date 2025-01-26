import { config } from 'dotenv';
config();

import { Client, Events, GatewayIntentBits } from 'discord.js';
import { Logging } from './helpers/logging';
import loadModules from './helpers/module_loader';

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.on(Events.ClientReady, async client => {
    Logging.info(`Logged in as ${client.user.tag}!`);
    await loadModules(client);
});

client.login(process.env.DISCORD_TOKEN);
