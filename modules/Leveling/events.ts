// modules/Leveling/events/leveling.js

import { Logging } from '@helpers/logging.ts';
import { Client, Message, Events as discordEvents } from 'discord.js';

export default class LevelingEvents {
    static usersXpAddedFromMessage: Array<any> = [];
    private client: Client;

    constructor(client: Client) {
        this.client = client;
        this.setupOnMessageCreateEvent();
    }

    setupOnMessageCreateEvent(): void {
        this.client.on(discordEvents.MessageCreate, async (message: Message): Promise<void> => {
            if (message.author.bot) return;

            Logging.debug('New message received');

            if (!LevelingEvents.usersXpAddedFromMessage.includes(message.author.id)) {
                LevelingEvents.usersXpAddedFromMessage.push(message.author.id);
            }
        });
    }

    static getUserXpAddedFromMessages(): Array<any> {
        return LevelingEvents.usersXpAddedFromMessage;
    }

    static purgeUserXpAddedFromMessages(): void {
        LevelingEvents.usersXpAddedFromMessage = [];
    }
}