import {
	Client,
	Message,
	ForumChannel
} from 'discord.js';
import { getEnv } from '@utils/env.ts';
import { Logging } from '@utils/logging';
import cron from 'node-cron';

export default class Tasks {
	private client: Client;

    constructor(client: Client) {
		this.client = client;
		cron.schedule('* * * * *', async (): Promise<void> => {
			await this.inactiveThreadClean();
		});
	}

	async inactiveThreadClean() {
		Logging.debug('Running inactive thread clean...');

		const forumChannel = await this.client.channels.fetch(<string>getEnv('TECH_SUPPORT')) as ForumChannel;

		if (!forumChannel) {
			Logging.warn(`Could not find or access tech support channel inside Support task!`);
			return;
		}

		const activeThreads = await forumChannel.threads.fetchActive();

		if (!activeThreads) {
			Logging.warn(`Could not find active threads inside Support task!`);
			return;
		}

		Logging.info(`Active threads: ${activeThreads.threads.map((t) => t.name).join(', ')}`);

		for (const [_, thread] of activeThreads.threads) {
			const createdAt = thread.createdAt;
			if (!createdAt) continue;

			const now = Date.now();
			const ageMs = now - createdAt.getTime();
			const ageHours = ageMs / (1000 * 60 * 60);

			if (ageHours >= 72) {
				const recentMessages = await thread.messages.fetch({ limit: 10 });
				const alreadyWarned = recentMessages.some(msg => msg.content.includes('Thread ouder dan 3 dagen'));

				if (!alreadyWarned) {
					Logging.info(`Thread "${thread.name}" is older than 3 days. Sending message.`);
					await thread.send('Thread ouder dan 3 dagen');
				}
			}
		}
	}
}