import { Client, Events as discordEvents, Message, EmbedBuilder, TextChannel, User } from 'discord.js';
import { Logging } from '@helpers/logging.ts';
import { Color } from '@enums/colorEnum';
import { getEnv } from '@helpers/env.ts';

export default class Events {
    private client: Client;
    private logChannel: any;

    constructor(client: Client) {
        this.client = client;
        // @ts-ignore
        this.logChannel = this.client.channels.cache.get(getEnv('ALL_DAY_LOG') as TextChannel);
        this.messageEvents();
        this.reactionEvents();
    }

    /**
     * Handles all message logging.
     *
     * - Message edit.
     * - Message delete.
     * - Message bulk delete.
     * @return void
     */
    messageEvents(): void {
        // @ts-ignore temp
        this.client.on(discordEvents.MessageUpdate, async (oldMessage: Message, newMessage: Message): Promise<void> => {
            Logging.debug('An message has been edited!');

            const messageUpdateEmbed: any = new EmbedBuilder()
                .setColor(Color.Orange)
                .setTitle('Bericht bewerkt')
                .setDescription(`${oldMessage.url}`)
                .setAuthor({
                    name: oldMessage.author.displayName,
                    iconURL: oldMessage.author.displayAvatarURL(),
                    url: oldMessage.author.displayAvatarURL()
                })
                .addFields(
                    { name: 'Oud:', value: oldMessage.content },
                    { name: 'Nieuw:', value: newMessage.content}
                );

            this.logChannel.send({ embeds: [messageUpdateEmbed] });
        });

        // @ts-ignore
        this.client.on(discordEvents.MessageDelete, async (message: Message): Promise<void> => {
            Logging.debug('An message has been deleted!');

            const messageDelete: any = new EmbedBuilder()
                .setColor(Color.Red)
                .setTitle('Bericht verwijderd')
                .setAuthor({
                    name: message.author.displayName,
                    iconURL: message.author.displayAvatarURL(),
                    url: message.author.displayAvatarURL()
                })
                .addFields(
                    { name: 'Bericht:', value: message.content },
                );

            this.logChannel.send({ embeds: [messageDelete] });
        });

        // @ts-ignore
        this.client.on(discordEvents.MessageBulkDelete, async (messages: Message[]): Promise<void> => {
            Logging.debug('Bulks messages has been deleted!');
            // WOP
        });
    }

    /**
     * Handles all reaction logging
     *
     * @return void
     */
    reactionEvents(): void {
        // @ts-ignore
        this.client.on('messageReactionAdd', (reaction, user) => {
            console.log(`messageReactionAdd: ${reaction} | ${user}`);
        });
    }
    // message edit (done)
    // message delete (done)
    // bulk message delete

    // reaction add
    // reaction remove

    // member join
    // member remove
    // member ban
    // member unban
    // member update (nickname change)

    // voice join
    // voice leave
    // voice change


}

