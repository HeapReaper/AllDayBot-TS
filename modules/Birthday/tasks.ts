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
			
			if (now.getHours() == 19 && now.getMinutes() == 31) {
				// To prevent spamming
				this.counter = 1;
				
				const birthdays: any[] = await Database.select('birthday');
				
				birthdays.forEach(birthday => {
					const paredBirthday = new Date(Date.parse(birthday.birthdate));
					if ((paredBirthday.getMonth() + 1) !== (now.getMonth() + 1) && paredBirthday.getDate() !== now.getDate()) {
						// @ts-ignore
						continue;
					}
					
					const channel = this.client.channels.cache.get(getEnv('GENERAL')!);
					if (!channel) return;
					
				});
			}
			
			if (now.getHours() == 19 && now.getMinutes() == 45) this.counter = 0;
			
			
		}, 10000);
	}
}