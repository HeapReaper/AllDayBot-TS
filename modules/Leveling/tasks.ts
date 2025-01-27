import { Logging } from '../../helpers/logging';
import { LevelingEvents } from './events.ts';
import Database from "../../helpers/database";

export class LevelingTasks {
    constructor(client: client) {
        this.client = client;
        this.addXpToMembersTask(10000); // change to 60 in prod
    }

    async addXpToMembersTask(time: number) {
        setInterval(async () => {
            try {
                await Database.connect();

                for (const userId of LevelingEvents.getUserXpAddedFromMessages()) {
                    try {
                        const result = await this.getUserFromDatabase(userId);

                        if (result.length < 1) {
                            await this.insertUserIntoDatabase(userId, 15);
                            continue;
                        }
                        const newXp = result[0].xp + 15;

                        if (newXp < Math.floor(8.196 * Math.pow(result[0].level + 1, 2.65) + 200)) {
                            await this.GainedXp(userId, newXp);
                            continue;
                        }

                        await this.gainedXpAndLevel(userId, newXp, result[0].level + 1);
                    } catch (err) {
                        console.error(`Error processing user ${userId}:`, err);
                    }
                }

                LevelingEvents.purgeUserXpAddedFromMessages();

                Logging.debug('Adding XP to members');
            } catch (err) {
                Logging.error('Database error:', err);
            }
        }, time);
    }
    async getUserFromDatabase(userId: string) {
        return await Database.query(`SELECT * FROM leveling WHERE user_id = ${userId}`);
    }

    async GainedXp(userId:string, xp: number) {
        await Database.query(`UPDATE leveling SET xp = ${xp}, last_updated = NOW() WHERE user_id = ${userId}`);
    }

    async gainedXpAndLevel(userId: string, xp: number, level: number) {
        await Database.query(`UPDATE leveling SET xp = ${xp}, last_updated = NOW(), level = ${level} WHERE user_id = ${userId}`);
    }

    async insertUserIntoDatabase(userId: string, xp: number) {
        await Database.query(`INSERT into leveling (user_id, xp, last_updated) VALUES (${userId}, 15, NOW())`);
    }
}

export default function (client: client) {
    new LevelingTasks(client);
}
