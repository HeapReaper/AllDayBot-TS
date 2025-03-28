// modules/Leveling/events/leveling.js

import { Logging } from '@helpers/logging.ts';
import {Client, Message, Events as discordEvents, GuildMember} from 'discord.js';
import Database from "@helpers/database.ts";

export default class LevelingEvents {
    static usersXpAddedFromMessage: Array<any> = [];
    private client: Client;

    constructor(client: Client) {
        this.client = client;
        this.setupOnMessageCreateEvent();
        this.onMemberLeaveEvent();
    }

    setupOnMessageCreateEvent(): void {
        this.client.on(discordEvents.MessageCreate, (message: Message): void => {
            if (message.author.bot) return;

            Logging.debug('New message received');

            if (LevelingEvents.usersXpAddedFromMessage.includes(message.author.id)) return;

            LevelingEvents.usersXpAddedFromMessage.push(message.author.id);
        });
    }

    onMemberLeaveEvent(): void {
        this.client.on(discordEvents.GuildMemberRemove, async (member: GuildMember): Promise<void> => {
            try {
                await Database.delete('leveling', {user_id: member.user.id});
                await Database.delete('birthday', {user_id: member.user.id});
            } catch (error) {
                Logging.error(`Error in leveling events onMemberLeaveEvent: ${error}`);
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