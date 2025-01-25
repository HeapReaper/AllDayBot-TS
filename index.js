import { config } from 'dotenv';
config();

import { Client, Events, GatewayIntentBits } from 'discord.js';
import {Logging} from './helpers/logging.js';
import Database from './helpers/database.js';


const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on(Events.ClientReady, readyClient => {
    Logging.info(`Logged in as ${client.user.tag}!`);

    // Testing
    Database.connect();
    Database.query('SELECT * FROM Users')
        .then(results => {
            Logging.info(JSON.stringify(results));
        })
        .catch(err => {
            Logging.error(JSON.stringify(err.message));
        });
        Database.close();
})

client.login(process.env.DISCORD_TOKEN);
