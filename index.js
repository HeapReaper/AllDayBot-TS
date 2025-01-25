import { config } from 'dotenv';
config();

import { Client, Events, GatewayIntentBits } from 'discord.js';
import { Logging } from './helpers/logging.js';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on(Events.ClientReady, readyClient => {
    Logging.info(`Logged in as ${client.user.tag}!`);
})

client.login(process.env.DISCORD_TOKEN);
