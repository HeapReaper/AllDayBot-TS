import { Client, TextChannel } from 'discord.js';
import { Logging } from '@utils/logging';
import QueryBuilder from '@utils/database';
import { getEnv } from '@utils/env.ts';
import cron from 'node-cron';

export default class Tasks {
	private client: Client;

    constructor(client: Client) {
		this.client = client;
		cron.schedule('0 10 * * *', async (): Promise<void> => {
			Logging.debug('Running Cron "checkBirthdays"');
			void this.checkBirthdays();
		});
	}
	
	async checkBirthdays(): Promise<void> {
		const now = new Date();

		const birthdays: any[] = await QueryBuilder.select('birthday').get();

		for (const birthday of birthdays) {
			const paredBirthday = new Date(Date.parse(birthday.birthdate));

			if ((paredBirthday.getMonth() + 1) !== (now.getMonth() + 1) && paredBirthday.getDate() !== now.getDate()) {
				continue;
			}

			const channel = this.client.channels.cache.get(<string>getEnv('GENERAL')!);
			if (!channel) {
				Logging.error('General channel not found in birthday tasks.');
				return;
			}

			// TODO: Send birthday message to channel
		}
	}
}