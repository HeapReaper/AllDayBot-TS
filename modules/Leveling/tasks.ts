// modules/Leveling/tasks

import { Logging } from '@helpers/logging.ts';
import LevelingEvents from './events.ts';
import Database from '@helpers/database';
import { Client, ChannelType, VoiceChannel, Guild } from 'discord.js';

export default class LevelingTasks {
    private client: Client;

    // @ts-ignore
    constructor(client: Client) {
        this.client = client;
        setInterval(async () => { void this.addXpToMembersTask(); }, 10000);
    }

    async addXpToMembersTask(): Promise<void> {
        Logging.debug(`Running task addXpToMembersTask()`);
        // Messaging
        for (const userId of LevelingEvents.getUserXpAddedFromMessages()) {
            try {
                const result: any = await Database.select('leveling', ['xp', 'level'], {user_id: userId});

                if (result.length == 0) {
                    await Database.insert('leveling', {'user_id': userId, 'xp': 15});
                    return;
                }

                const newXp: number = result[0].xp + 15;

                if (newXp < Math.floor(8.196 * Math.pow(result[0].level + 1, 2.65) + 200)) {
                    await Database.update('leveling', {xp: newXp}, {user_id: userId});
                    continue;
                }

                await Database.update('leveling', {xp: newXp, level: result[0].level + 1}, {user_id: userId});
            } catch (error: any) {
                console.error(`Error processing user ${userId} in Leveling tasks: `, error);
            }
        }

        LevelingEvents.purgeUserXpAddedFromMessages();

        // Voice
        try {
            const guilds = await this.client.guilds.fetch();
            const guild = guilds.first() as Guild;

            if (!guild) return;

            console.log(`Checking voice channels in ${guild.name}`);

            // Fetch channels and filter voice channels
            const channels = await guild.channels.fetch();
            const voiceChannels = [...channels.filter(channel => channel.type === ChannelType.GuildVoice).values()] as VoiceChannel[];

            for (const voiceChannel of voiceChannels) {
                if (!voiceChannel || !voiceChannel.members.size) continue;

                console.log(`🔊 Checking voice channel: ${voiceChannel.name}`);

                for (const member of voiceChannel.members.values()) {
                    console.log(`👤 Member in voice: ${member.user.tag}`);
                }
            }
        } catch (error) {
            console.error(`Error inside checkVoiceChannels: ${error}`);
        }

        Logging.debug('Adding XP to members');
    }
}