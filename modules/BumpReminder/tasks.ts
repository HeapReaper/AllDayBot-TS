import { Client, TextChannel } from 'discord.js';
import { getEnv } from '@utils/env.ts';
import { Logging } from '@utils/logging';
import cron from 'node-cron';

export default class Tasks {
    private client: Client;
    private bumpChannel: TextChannel;

    constructor(client: Client) {
        this.client = client;
        this.bumpChannel = this.client.channels.cache.get(<string>getEnv('BUMP')) as TextChannel;
        cron.schedule('*/5 * * * *', async (): Promise<void> => {
            await this.remindBump();
            Logging.debug('Running Cron "remindBump"');
        });
    }

    async remindBump(): Promise<void> {
        const messages = await this.bumpChannel.messages.fetch({limit: 20});

        if (messages.size === 0) return;

        const lastMessage = messages.first();
        if (!lastMessage) return;

        if (lastMessage?.author.id === this.client.user?.id) return;

        if (lastMessage.createdTimestamp > Date.now() - (2 * 60 *60 * 1000)) return;

        await this.bumpChannel.send('De server kan weer gebumped worden! Dit kan d.m.v het command `/bump`. Dit helpt de server groeien!\n');
    }
}

