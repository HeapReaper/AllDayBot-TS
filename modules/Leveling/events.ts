// modules/Leveling/events/leveling.js

import {Logging} from '../../helpers/logging';
import {Client} from "discord.js";

export class LevelingEvents {
    static usersXpAddedFromMessage: array = [];
    static usersXpAddedFromVc: array = [];

    constructor(client: Client) {
        this.client = client;
        this.setupOnMessageCreateEvent();
        this.setupOnMemberLeaveEvent();
    }

    setupOnMemberLeaveEvent(): void {
        //
    }

    setupOnMessageCreateEvent(): void {
        this.client.on('messageCreate', async (message: Message) => {
            if (message.author.bot) return;

            Logging.debug('New message received');

            if (!LevelingEvents.usersXpAddedFromMessage.includes(message.author.id)) {
                LevelingEvents.usersXpAddedFromMessage.push(message.author.id);
            }
        });
    }

    static getUserXpAddedFromMessages(): array {
        return LevelingEvents.usersXpAddedFromMessage;
    }

    static purgeUserXpAddedFromMessages(): void {
        LevelingEvents.usersXpAddedFromMessage = [];
    }
}

export default function (client: Client) {
    new LevelingEvents(client);
}