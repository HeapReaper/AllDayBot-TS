// modules/Birthday/tasks.ts

import { Client, TextChannel } from 'discord.js';
import { Logging } from '@helpers/logging';
import Database from '@helpers/database';
import { getEnv } from '@helpers/env.ts';

export default class Tasks {
	private client: Client;
	private counter: number;
	
    constructor(client: Client) {
		this.client = client;
		this.counter = 0;
		void this.checkBirthdays();
	}
	
	async checkBirthdays(): Promise<void> {
		
		setInterval(async (): Promise<void> => {
			Logging.debug('Checking for birthdays...');
			
			const now = new Date();
			
			if (now.getHours() == 10 && now.getMinutes() == 0o0) {
				// To prevent spamming
				this.counter = 1;
				
				const birthdays: any[] = await Database.select('birthday');
				
				for (const birthday of birthdays) {
					const paredBirthday = new Date(Date.parse(birthday.birthdate));
					if ((paredBirthday.getMonth() + 1) !== (now.getMonth() + 1) && paredBirthday.getDate() !== now.getDate()) {
						continue;
					}
					
					const channel = this.client.channels.cache.get(getEnv('GENERAL')!);
					if (!channel) {
						Logging.error('General channel not found in birthday tasks.');
						return;
					}
					
					// Send birthday message to channel
				}
			}
			
			if (now.getHours() == 10 && now.getMinutes() == 10) this.counter = 0;
			
			
		}, 10000);
	}
}