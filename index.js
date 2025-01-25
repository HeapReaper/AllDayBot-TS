const { Client, Events, GatewayIntentBits } = require('discord.js');
const config = require('./config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('ready', () => {
    console.log('Ready!');
});

client.login(config.token);
