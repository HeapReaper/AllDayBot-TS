import { Client, TextChannel, Events, Message } from 'discord.js';
import { getEnv } from '@utils/env.ts';
import { Logging } from '@utils/logging';

export default class ShowcaseEvents {
    private client: Client;

    constructor(client: Client) {
        this.client = client;
        void this.onShowcaseMessage();
    }
    
    async onShowcaseMessage(): Promise<void> {
        this.client.on(Events.MessageCreate, async (message: Message): Promise<void> => {
            if (message.author.id === this.client.user?.id) return;

            let messageByAuthor: Array<number> = [];
            
            if (message.channel.id !== getEnv('SHOWCASE')!) return;
            
            if (!message) return;
            const showcaseChannel = await this.client.channels.fetch(<string>getEnv('SHOWCASE')) as TextChannel;
            
            if (!showcaseChannel) {
                Logging.error('Showcase channel not found in ShowcaseRemover events!');
                return;
            }
            
            // @ts-ignore
            const allMessages = await showcaseChannel.messages.fetch({limit: 100});
            for (const [messageId, messageObject] of allMessages) {
                if (messageObject.author.id !== message.author.id) {
                    continue;
                }
                
                messageByAuthor.push(Number(messageId));
            }
            Logging.debug(`Showcase message count per author: ${messageByAuthor}`);
            
            if (messageByAuthor.length <= 1) return;
            
            await message.delete();
            
            if (!message.guild) return;
            
            const notificationMessage = await showcaseChannel.send(`
            Je hebt al een showcase bericht geplaatst! Bericht link: https://discord.com/channels/${message.guild.id}/${message.channel.id}/${messageByAuthor[1]}.\nVerwijder die eerst om een nieuw bericht te plaatsen.
            `);
            
            setTimeout((): any => notificationMessage.delete(), 7000);
        });
    }
}
