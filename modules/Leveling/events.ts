import { Logging } from '@utils/logging';
import {
    Client,
    Message,
    Events as discordEvents,
    GuildMember
} from 'discord.js';
import QueryBuilder from '@utils/database';

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
            if (message.author.id === this.client.user?.id || message.author.bot) return;

            if (LevelingEvents.usersXpAddedFromMessage.includes(message.author.id)) return;

            LevelingEvents.usersXpAddedFromMessage.push(message.author.id);
        });
    }

    onMemberLeaveEvent(): void {
        // @ts-ignore
        this.client.on(discordEvents.GuildMemberRemove, async (member: GuildMember): Promise<void> => {
            try {
                await QueryBuilder
                    .delete('leveling')
                    .where({user_id: member.user.id})
                    .execute();

                await QueryBuilder
                    .delete('birthday')
                    .where({user_id: member.user.id})
                    .execute();
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