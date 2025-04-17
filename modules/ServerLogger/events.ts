import {
    Client,
    Events as discordEvents,
    Message,
    EmbedBuilder,
    TextChannel, User,
    AttachmentBuilder,
} from 'discord.js';
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
        const chatIcon = new AttachmentBuilder(`${<string>getEnv('MODULES_BASE_PATH')}src/media/icons/chat.png`);

        // @ts-ignore temp
        this.client.on(discordEvents.MessageUpdate, async (oldMessage: Message, newMessage: Message): Promise<void> => {
            Logging.debug('An message has been edited!');

            const messageUpdateEmbed: any = new EmbedBuilder()
                .setColor(Color.Orange)
                .setTitle('Bericht bewerkt')
                .setDescription(`Door: <@${oldMessage.author.id}>`)
                .setAuthor({
                    name: oldMessage.author.displayName,
                    iconURL: oldMessage.author.displayAvatarURL(),
                    url: oldMessage.author.displayAvatarURL()
                })
                .setThumbnail('attachment://chat.png')
                .addFields(
                    { name: 'Oud:', value: oldMessage.content },
                    { name: 'Nieuw:', value: newMessage.content}
                );

            this.logChannel.send({ embeds: [messageUpdateEmbed], files: [chatIcon] });
        });

        // @ts-ignore
        this.client.on(discordEvents.MessageDelete, async (message: Message): Promise<void> => {
            Logging.debug('An message has been deleted!');

            const messageDelete: any = new EmbedBuilder()
                .setColor(Color.Red)
                .setTitle('Bericht verwijderd')
                .setDescription(`Door: <@${message.author.id}>`)
                .setAuthor({
                    name: message.author.displayName,
                    iconURL: message.author.displayAvatarURL(),
                    url: message.author.displayAvatarURL()
                })
                .setThumbnail('attachment://chat.png')
                .addFields(
                    { name: 'Bericht:', value: message.content },
                );

            this.logChannel.send({ embeds: [messageDelete], files: [chatIcon] });
        });

        // @ts-ignore
        this.client.on(discordEvents.MessageBulkDelete, async (messages: Collection<string, Message>): Promise<void> => {
            Logging.debug('Bulk messages have been deleted!');

            const deletedMessages: any[] = [];

            for (const message of messages.values()) {
                deletedMessages.push({
                    name: `Van: ${message.member?.displayName || message.author?.tag || 'Niet bekend'}`,
                    value: message.content || 'Geen inhoud',
                });
            }

            const bulkMessagesDeleted: EmbedBuilder = new EmbedBuilder()
                .setColor(Color.Red)
                .setTitle('Bulk berichten verwijderd')
                .setThumbnail('attachment://chat.png')
                .addFields(...deletedMessages);

            await this.logChannel.send({ embeds: [bulkMessagesDeleted], files: [chatIcon]});
        });
    }

    /**
     * Handles all reaction logging
     *
     * @return void
     */
    reactionEvents(): void {
        this.client.on(discordEvents.MessageReactionAdd, async (reaction, user) => {            const chatIcon = new AttachmentBuilder(`${<string>getEnv('MODULES_BASE_PATH')}src/media/icons/chat.png`);
            Logging.info('Reaction added to message!');

            const messageReactionAddEmbed: EmbedBuilder = new EmbedBuilder()
                .setColor(Color.Green)
                .setTitle('Reactie toegevoegd')
                .setDescription(`Door: <@${user.id}>`)
                .setThumbnail('attachment://chat.png')
                .addFields(
                    { name: 'Emoji:', value: `${reaction.emoji}` },
                    { name: 'Bericht:', value: `${reaction.message.url}` }
                );

            await this.logChannel.send({embeds: [messageReactionAddEmbed], files: [chatIcon]});
        });

        this.client.on(discordEvents.MessageReactionRemove, async (reaction, user) => {            const chatIcon = new AttachmentBuilder(`${<string>getEnv('MODULES_BASE_PATH')}src/media/icons/chat.png`);
            Logging.info('Reaction removed to message!');

            const messageReactionAddEmbed: EmbedBuilder = new EmbedBuilder()
                .setColor(Color.Orange)
                .setTitle('Reactie verwijderd')
                .setDescription(`Door: <@${user.id}>`)
                .setThumbnail('attachment://chat.png')
                .addFields(
                    { name: 'Emoji:', value: `${reaction.emoji}` },
                    { name: 'Bericht:', value: `${reaction.message.url}` }
                );

            await this.logChannel.send({embeds: [messageReactionAddEmbed], files: [chatIcon]});
        });
    }

    // message edit (done)
    // message delete (done)
    // bulk message delete (done)

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

