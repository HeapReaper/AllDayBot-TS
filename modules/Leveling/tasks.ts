// modules/Leveling/tasks

import { Logging } from '../../helpers/logging';
import { LevelingEvents } from './events.ts';
import Database from "../../helpers/database";
import { Client } from "discord.js";

export class LevelingTasks {
    private client: Client;

    // @ts-ignore
    constructor(client: client) {
        this.client = client;
        this.addXpToMembersTask(10000)
            .then(() => {})
            .catch((error) => {Logging.error('Error in addXpToMembersTask')}); // change to 60 in prod
    }

    async addXpToMembersTask(time: number): Promise<void> {
        setInterval(async () => {
            try {
                Database.connect();

                for (const userId of LevelingEvents.getUserXpAddedFromMessages()) {
                    try {
                        const result = this.getUserFromDatabase(userId);

                        if (result.length < 1) {
                            await this.insertUserIntoDatabase(userId, 15);
                            continue;
                        }
                        const newXp = result[0].xp + 15;

                        if (newXp < Math.floor(8.196 * Math.pow(result[0].level + 1, 2.65) + 200)) {
                            this.gainedXp(userId, newXp);
                            continue;
                        }

                        await this.gainedXpAndLevel(userId, newXp, result[0].level + 1);
                    } catch (err) {
                        console.error(`Error processing user ${userId}:`, err);
                    }
                }

                LevelingEvents.purgeUserXpAddedFromMessages();

                Logging.debug('Adding XP to members');
            } catch (error: any) {
                Logging.error(`Database error: ${error.message}`);
            }
        }, time);
    }

    getUserFromDatabase(userId: string) {
        return Database.query(`SELECT * FROM leveling WHERE user_id = ${userId}`);
    }

    gainedXp(userId:string, xp: number) {
        Database.query(`UPDATE leveling SET xp = ${xp}, last_updated = NOW() WHERE user_id = ${userId}`);
    }

    async gainedXpAndLevel(userId: string, xp: number, level: number) {
        await Database.query(`UPDATE leveling SET xp = ${xp}, last_updated = NOW(), level = ${level} WHERE user_id = ${userId}`);
    }

    async insertUserIntoDatabase(userId: string, xp: number) {
        await Database.query(`INSERT into leveling (user_id, xp, last_updated) VALUES (${userId}, 15, NOW())`);
    }
}

export default function (client: Client): void {
    new LevelingTasks(client);
}
