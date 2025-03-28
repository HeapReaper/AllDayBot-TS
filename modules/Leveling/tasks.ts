// modules/Leveling/tasks

import { Logging } from '@helpers/logging.ts';
import LevelingEvents from './events.ts';
import Database from '@helpers/database';
import { Client } from 'discord.js';

export default class LevelingTasks {
    private client: Client;

    // @ts-ignore
    constructor(client: client) {
        this.client = client;
        this.addXpToMembersTask(60000) // Change to 60000 in prod
            .then((): void => {})
            .catch((error: any): void => { Logging.error('Error in addXpToMembersTask') });
    }

    async addXpToMembersTask(time: number): Promise<void> {
        setInterval(async () => {
            try {
                Database.connect();

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

                Logging.debug('Adding XP to members');
            } catch (error: any) {
                Logging.error(`Database error: ${error.message}`);
            }
        }, time);
    }
}