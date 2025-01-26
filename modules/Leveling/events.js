// modules/Leveling/events/leveling.js

import {Logging} from '../../helpers/logging.js';

export class LevelingEvents {
    constructor(client) {
        this.client = client;
        this.setupEventListener();
        this.xpForEachMessage = 60;
        this.usersToHaveXpAdded = [];
    }

    setupEventListener() {
        this.client.on('messageCreate', async (message) => {
            if (message.author.bot) return;

            Logging.debug('New message received');
        });
    }
}

export default function (client) {
    new LevelingEvents(client);
}