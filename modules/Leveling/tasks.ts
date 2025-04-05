// modules/Leveling/tasks

import { Logging } from '@helpers/logging.ts';
import LevelingEvents from './events.ts';
import Database from '@helpers/database';
import { Client, ChannelType, VoiceChannel, Guild } from 'discord.js';
import {getEnv} from "@helpers/env.ts";

export default class LevelingTasks {
    private client: Client;
    private static taskRunning: boolean = false;

    // @ts-ignore
    constructor(client: Client) {
        this.client = client;
        setInterval(async () => {
            void this.addXpToMembersTask();
        }, 60000);
    }

    async addXpToMembersTask(): Promise<void> {
        Logging.debug(`Running task addXpToMembersTask()`);

        // Messaging
        for (const userId of LevelingEvents.getUserXpAddedFromMessages()) {
            try {
                await this.addXpToMember(userId, this.generateRandomNumber(15, 25));
            } catch (error: any) {
                console.error(`Error processing user ${userId} in Leveling tasks: `, error);
            }
        }

        LevelingEvents.purgeUserXpAddedFromMessages();

        // Voice
        try {
            Logging.debug('Looking into voice channels to add XP');
            const guild = await this.client.guilds.fetch('1093873145313767495') as Guild;

            if (!guild) return;

            // Fetch channels and filter voice channels
            const channels = await guild.channels.fetch();
            const voiceChannels = [...channels.filter(channel => channel.type === ChannelType.GuildVoice).values()] as VoiceChannel[];

            for (const voiceChannel of voiceChannels) {
                if (!voiceChannel || !voiceChannel.members.size) continue;

                if (voiceChannel.name === 'AFK' || voiceChannel.name === 'afk') return;

                for (const member of voiceChannel.members.values()) {
                    await this.addXpToMember(member.id, this.generateRandomNumber(4, 6));

                    Logging.debug(`Someone is in VC: ${member.user.tag}`)
                }
            }
        } catch (error) {
            console.error(`Error inside checkVoiceChannels: ${error}`);
        }

        Logging.debug('Adding XP to members');

    }

    async addXpToMember(userId: String, xpToAdd: number) {
        const result: any = await Database.select('leveling', ['xp', 'level'], {user_id: userId});
        if (result.length == 0) {
            await Database.insert('leveling', {'user_id': userId, 'xp': xpToAdd});
            return;
        }

        const newXp: number = result[0].xp + xpToAdd;

        if (newXp < Math.floor(8.196 * Math.pow(result[0].level + 1, 2.65) + 200)) {
            await Database.update('leveling', {xp: newXp}, {user_id: userId});
            return;
        }

        await Database.update('leveling', {xp: newXp, level: result[0].level + 1}, {user_id: userId});
    }

    // Returns a random number between min and max
    generateRandomNumber(min: number, max: number): Number {
        return Math.floor(Math.random() * (max - min)) + min;
    }
}