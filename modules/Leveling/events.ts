import { Logging } from '@helpers/logging.ts';
import { Client, Message, Events as discordEvents, GuildMember } from 'discord.js';
import Database from "@helpers/database.ts";

export default class LevelingEvents {
    static usersXpAddedFromMessage: Array<any> = [];
    static usersInVoice: Array<any> = [];
    private client: Client;

    constructor(client: Client) {
        this.client = client;
        this.setupOnMessageCreateEvent();
        this.onMemberLeaveEvent();
        this.onVoiceEvent();
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

    onVoiceEvent(): void {
        this.client.on('voiceStateUpdate', async (oldState, newState): Promise<void> => {
            Logging.debug(`${LevelingEvents.usersInVoice}`)

            if (newState.channel?.name === 'AFK') {
                LevelingEvents.usersInVoice = LevelingEvents.usersInVoice.filter(item => item !== oldState.member?.user?.id);
                Logging.debug(`${LevelingEvents.usersInVoice}`)

                return;
            }

            Logging.debug(`${LevelingEvents.usersInVoice}`)

            // On user voice join
            if (oldState.channelId === null && newState.channelId !== null) {
                if (LevelingEvents.usersInVoice.includes(newState.member?.user?.id)) return;

                LevelingEvents.usersInVoice.push(newState.member?.user?.id);
                Logging.info(`A user with the name ${newState.member?.user?.displayName} joined voice channel ${newState.channel?.name}`);

                Logging.debug(`${LevelingEvents.usersInVoice}`)

                return;
            }

            if (oldState.channel?.name === 'AFK' && newState.channel?.id !== 'AFk') {
                LevelingEvents.usersInVoice.push(newState.member?.user?.id);
                Logging.info(`A user with the name ${newState.member?.user?.displayName} has moved voice from AFK to ${newState.channel?.name}`);
                Logging.debug(`${LevelingEvents.usersInVoice}`)

                return
            }

            // On user VC change
            if (oldState.channelId !== newState.channelId) return;

            // On user voice leave
            LevelingEvents.usersInVoice = LevelingEvents.usersInVoice.filter(item => item !== oldState.member?.user?.id);
            Logging.info(`A user with the name ${oldState.member?.user?.displayName} leaved voice channel ${oldState.channel?.name}`);

            Logging.debug(`${LevelingEvents.usersInVoice}`)
        });
    }

    static getUserXpAddedFromMessages(): Array<any> {
        return LevelingEvents.usersXpAddedFromMessage;
    }

    static purgeUserXpAddedFromMessages(): void {
        LevelingEvents.usersXpAddedFromMessage = [];
    }

    static getUsersInVoice(): Array<any> {
        return LevelingEvents.usersInVoice;
    }
}