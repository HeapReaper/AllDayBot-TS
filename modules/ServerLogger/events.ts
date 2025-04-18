import {
    Client,
    Events as discordEvents,
    Message,
    EmbedBuilder,
    TextChannel, User,
    AttachmentBuilder, VoiceState,
} from 'discord.js';
import { Logging } from '@helpers/logging.ts';
import { Color } from '@enums/colorEnum';
import { getEnv } from '@helpers/env.ts';

export default class Events {
    private client: Client;
    private logChannel: any;

    constructor(client: Client) {
        this.client = client;
        this.logChannel = this.client.channels.cache.get(<string>getEnv('ALL_DAY_LOG')) as TextChannel;
        this.messageEvents();
        this.reactionEvents();
        this.voiceChannelEvents();
        this.memberEvents();
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
        const chatIcon = new AttachmentBuilder(`${<string>getEnv('MODULES_BASE_PATH')}src/media/icons/chat.png`);

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

    /**
     * Handles voice channel logging
     *
     * @return void
     */
    voiceChannelEvents(): void {
        this.client.on(discordEvents.VoiceStateUpdate, async (oldState: VoiceState, newState: VoiceState) => {
            const voiceChannelIcon = new AttachmentBuilder(`${<string>getEnv('MODULES_BASE_PATH')}src/media/icons/microphone.png`);

            // If user joins voice channel
            if (!oldState.channel && newState.channel) {
                const voiceChannelEmbed: EmbedBuilder = new EmbedBuilder()
                    .setColor(Color.Green)
                    .setTitle('Voice kanaal gejoined')
                    .setDescription(`Door: <@${oldState.member?.id}>`)
                    .setAuthor({
                        name: newState.member?.displayName ?? 'Niet bekend',
                        iconURL: newState.member?.displayAvatarURL(),
                        url: newState.member?.displayAvatarURL()
                    })
                    .setThumbnail('attachment://microphone.png')
                    .addFields(
                        { name: 'Kanaal:', value: `${newState.channel.url}` },
                    );

                await this.logChannel.send({embeds: [voiceChannelEmbed], files: [voiceChannelIcon]});
            }

            // If user leaves voice channel
            if (oldState.channel && !newState.channel) {
                Logging.info('A user leaved VC');

                const voiceChannelEmbed: EmbedBuilder = new EmbedBuilder()
                    .setColor(Color.Orange)
                    .setTitle('Voice kanaal verlaten')
                    .setDescription(`Door: <@${oldState.member?.id}>`)
                    .setAuthor({
                        name: oldState.member?.displayName ?? 'Niet bekend',
                        iconURL: oldState.member?.displayAvatarURL(),
                        url: oldState.member?.displayAvatarURL()
                    })
                    .setThumbnail('attachment://microphone.png')
                    .addFields(
                        { name: 'Kanaal:', value: `${oldState.channel.url}` },
                    );

                await this.logChannel.send({embeds: [voiceChannelEmbed], files: [voiceChannelIcon]});
            }

            // If user changes voice channel
            if (oldState.channel && newState.channel) {
                Logging.info('A user changed VC');

                const voiceChannelEmbed: EmbedBuilder = new EmbedBuilder()
                    .setColor(Color.Green)
                    .setTitle('Voice kanaal veranderd')
                    .setDescription(`Door: <@${oldState.member?.id}>`)
                    .setAuthor({
                        name: newState.member?.displayName ?? 'Niet bekend',
                        iconURL: newState.member?.displayAvatarURL(),
                        url: newState.member?.displayAvatarURL()
                    })
                    .setThumbnail('attachment://microphone.png')
                    .addFields(
                        { name: 'Oud:', value: `${oldState.channel.url}` },
                        { name: 'Nieuw:', value: `${newState.channel.url}` },
                    );

                await this.logChannel.send({embeds: [voiceChannelEmbed], files: [voiceChannelIcon]});
            }
        });
    }

    memberEvents(): void {
        this.client.on(discordEvents.GuildMemberUpdate, async (oldMember, newMember): Promise<void> => {
            if (oldMember.displayName !== newMember.displayName || oldMember.nickname !== newMember.nickname) {
                Logging.info('A user changed its nickname or display name!');
            }
        });
    }

    // message edit (done)
    // message delete (done)
    // bulk message delete (done)

    // image/video/gif cacher S3

    // reaction add (done)
    // reaction remove (done)

    // voice join (done)
    // voice leave (done)
    // voice change (done)


    // member join
    // member remove
    // member ban
    // member unban
    // member update (nickname change)
}

