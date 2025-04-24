import {
    Client,
    TextChannel,
    DMChannel,
    Events as discordEvents,
    Message,
} from 'discord.js';
import { Logging } from '@utils/logging';

export default class Events {
    private client: Client;

    constructor(client: Client) {
        this.client = client;
        this.onMessageEvent();
    }

    onMessageEvent(): void {
        this.client.on(discordEvents.MessageCreate, async (message: Message): Promise<void> => {
            if (message.author.bot) return;

            if (!message.channel.isDMBased()) return;

            Logging.info('Recieved a DM message!');
        });
    }
}
