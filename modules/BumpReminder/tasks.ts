import { Client, TextChannel } from 'discord.js';
import { getEnv } from '@utils/env.ts';
import { Logging } from '@utils/logging';

export default class Tasks {
    private client: Client;
    private bumpChannel: TextChannel;

    constructor(client: Client) {
        this.client = client;
        this.bumpChannel = this.client.channels.cache.get(<string>getEnv('BUMP')) as TextChannel;
        this.remindBump();
    }

    remindBump(): void {
        setInterval(() => {
            Logging.debug('Checking if server can be bumped again!');
            const messages = this.bumpChannel.messages.fetch({limit: 20});

            messages.then((messages): void => {
                if (messages.size === 0) return;

                const lastMessage = messages.first();
                if (!lastMessage) return;

                if (lastMessage?.author.id === this.client.user?.id) return;

                if (lastMessage.createdTimestamp > Date.now() - (2 * 60 *60 * 1000)) return;

                this.bumpChannel.send('De server kan weer gebumped worden!');
            });
        }, 20000);
    }
}

