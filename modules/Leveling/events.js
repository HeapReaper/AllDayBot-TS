// modules/Leveling/events/leveling.js

import {Logging} from '../../helpers/logging.js';

export class LevelingEvents {
    static usersXpAddedFromMessage = [];
    static usersXpAddedFromVc = [];

    constructor(client) {
        this.client = client;
        this.setupOnMessageCreateEvent();
        this.setupOnMemberLeaveEvent();
    }

    setupOnMemberLeaveEvent() {
        //
    }

    setupOnMessageCreateEvent() {
        this.client.on('messageCreate', async (message) => {
            if (message.author.bot) return;

            Logging.debug('New message received');

            if (!LevelingEvents.usersXpAddedFromMessage.includes(message.author.id)) {
                LevelingEvents.usersXpAddedFromMessage.push(message.author.id);
            }
        });
    }

    // Static methods to access the static array
    static getUserXpAddedFromMessages() {
        return LevelingEvents.usersXpAddedFromMessage;
    }

    static purgeUserXpAddedFromMessages() {
        LevelingEvents.usersXpAddedFromMessage = [];
    }
}

export default function (client) {
    new LevelingEvents(client);
}