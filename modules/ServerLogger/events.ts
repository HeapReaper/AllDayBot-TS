import {
    AttachmentBuilder,
    AuditLogEvent,
    Client,
    EmbedBuilder,
    Events as discordEvents,
    GuildBan,
    GuildMember,
    Message,
    OmitPartialGroupDMChannel,
    PartialGuildMember,
    PartialMessage,
    TextChannel,
    VoiceState,
    User,
    Collection,
    Snowflake,
} from 'discord.js';
import { Logging } from '@utils/logging.ts';
import { Color } from '@enums/colorEnum';
import { getEnv } from '@utils/env.ts';
import S3OperationBuilder from '@utils/s3';
import QueryBuilder from '@utils/database.ts';
import path from 'path';
import { Github } from '@utils/github';
import { __ } from '@utils/i18n';
import { Faker } from '@heapreaper/discordfaker';

export default class Events {
    private client: Client;
    private logChannel: any;
    private botIcon: AttachmentBuilder;
    private chatIcon: AttachmentBuilder;
    private voiceChatIcon: AttachmentBuilder;
    private reactionIcon: AttachmentBuilder;
    private userIcon: AttachmentBuilder;
    private moderationIcon: AttachmentBuilder;

    constructor(client: Client) {
        this.client = client;
        this.logChannel = this.client.channels.cache.get(getEnv('ALL_DAY_LOG') as string) as TextChannel;
        this.botIcon = new AttachmentBuilder(`${getEnv('MODULES_BASE_PATH') as string}src/media/icons/bot.png`);
        this.chatIcon = new AttachmentBuilder(`${getEnv('MODULES_BASE_PATH') as string}src/media/icons/chat.png`);
        this.voiceChatIcon = new AttachmentBuilder(`${getEnv('MODULES_BASE_PATH') as string}src/media/icons/microphone.png`);
        this.reactionIcon = new AttachmentBuilder(`${getEnv('MODULES_BASE_PATH') as string}src/media/icons/happy-face.png`);
        this.userIcon = new AttachmentBuilder(`${getEnv('MODULES_BASE_PATH') as string}src/media/icons/user.png`);
        this.moderationIcon = new AttachmentBuilder(`${getEnv('MODULES_BASE_PATH') as string}src/media/icons/moderation.png`);
        void this.bootEvent()
        this.messageEvents();
        this.reactionEvents();
        this.voiceChannelEvents();
        void this.memberEvents();
    }

    async bootEvent(): Promise<void> {
        try {
            const currentRelease: string | null = await Github.getCurrentRelease();

            await new Promise<void>(resolve => {
                const interval: Timer = setInterval((): void => {
                    if (this.client.ws.ping >= 0) {
                        clearInterval(interval);
                        resolve();
                    }
                }, 500);
            });

            const bootEmbed: EmbedBuilder = new EmbedBuilder()
                .setColor(Color.AdtgPurple)
                .setTitle('Ik ben opnieuw opgestart!')
                .addFields(
                    { name: __('User'), value: `<@${this.client.user?.id}>` },
                    { name: __('Version'), value: `${currentRelease ? currentRelease : 'Rate limited'}` },
                    { name: __('Ping'), value: `${this.client.ws.ping}ms` }
                )
                .setThumbnail('attachment://bot.png');

            Logging.info('Sending bootEvent')

            await this.logChannel.send({ embeds: [bootEmbed], files: [this.botIcon] });
        } catch (error) {
            Logging.error(`Error in bootEvent serverLogger: ${error}`);
        }
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
        this.client.on(discordEvents.MessageCreate, async (message: Message): Promise<void> => {
            if (message.author.id === this.client.user?.id || message.author.bot) return;

            Logging.info('Caching message');

            try {
                await QueryBuilder.insert('messages')
                    .values({
                        id: message.id,
                        channel_id: message.channel.id,
                        guild_id: message.guild?.id,
                        author_id: message.author.id,
                        content: message.content,
                        created_at: message.createdAt,
                        attachments: JSON.stringify(
                            message.attachments.map(attachment => ({
                                url: attachment.url,
                                name: attachment.name,
                                contentType: attachment.contentType,
                                s3Key: `serverLogger/${message.id}-${attachment.name}`,
                            })),
                        )
                    })
                    .execute();
            } catch (error) {
                Logging.error(`Error while trying to cache message inside server logger: ${error}`);
            }

            if (!message.attachments.size) return;

            try {
                for (const attachment of message.attachments.values()) {
                    const fileUrl = attachment.url;
                    const fileName = `${message.id}-${path.basename(fileUrl)}`;

                    const response = await fetch(fileUrl);
                    const arrayBuffer = await response.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);

                    if (!attachment.contentType?.startsWith('image/') && !attachment.contentType?.startsWith('video/')) return;

                    Logging.info('Caching a image/video to S3');

                    await S3OperationBuilder
                        .setBucket(getEnv('S3_BUCKET_NAME') as string)
                        .uploadFileFromBuffer(`serverLogger/${fileName}`, buffer, {
                            'Content-Type': attachment.contentType,
                        });
                }
            } catch (error) {
                Logging.error(`Error while caching image/video inside server logger: ${error}`);
            }
        });

        this.client.on(discordEvents.MessageUpdate, async (
                oldMessage: OmitPartialGroupDMChannel<Message<boolean> | PartialMessage>,
                newMessage: OmitPartialGroupDMChannel<Message<boolean>>): Promise<void> => {
            if (newMessage.author.id === this.client.user?.id) return;

            Logging.debug('An message has been edited!');

            const messageUpdateEmbed: any = new EmbedBuilder()
                .setColor(Color.Orange)
                .setTitle('Bericht bewerkt')
                .setThumbnail('attachment://chat.png')
                .addFields(
                    { name: __('User'), value: `<@${oldMessage.author?.id}>`},
                    { name: __('Old'), value: oldMessage.content ?? 'Er ging wat fout' },
                    { name: __('New'), value: newMessage.content ?? 'Er ging wat fout'}
                );

            this.logChannel.send({ embeds: [messageUpdateEmbed], files: [this.chatIcon] });
        });

        this.client.on(discordEvents.MessageDelete, async (message: Message<boolean> | PartialMessage): Promise<void> => {
            if (message.author?.id === this.client.user?.id) return;

            Logging.debug('An message has been deleted!');

            const allS3Files = await S3OperationBuilder
                .setBucket(getEnv('S3_BUCKET_NAME') as string)
                .listObjects();

            const messageFromDbCache = await QueryBuilder
                .select('messages')
                .where({id: message.id})
                .first();

            Logging.debug(`${messageFromDbCache}`)

            if (!allS3Files.success) {
                Logging.warn('Failed to list S3 objects. Skipping attachment restoration.');
                return;
            }

            const filesToAttach = allS3Files.data.filter((file: any) =>
                file?.name?.startsWith(`serverLogger/${message.id}-`)
            );

            const attachments: AttachmentBuilder[] = [];

            const messageDelete: any = new EmbedBuilder()
                .setColor(Color.Red)
                .setTitle('Bericht verwijderd')
                .setThumbnail('attachment://chat.png')
                .addFields(
                    {
                        name: __('User'),
                        value: `<@${message.partial ? messageFromDbCache.author_id ?? '10101' : message.author?.id ?? 'Onbekend'}>`
                    },
                    {
                        name: __('Message'),
                        value: message.content ?? 'Er ging wat fout'
                    }
                );

            for (const file of filesToAttach) {
                const url = await S3OperationBuilder
                    .setBucket(getEnv('S3_BUCKET_NAME') as string)
                    .getObjectUrl(file.name);

                const response = await fetch(url);
                const arrayBuffer = await response.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                const filename = file.name.split('/').pop() ?? 'attachment';
                attachments.push(new AttachmentBuilder(buffer, { name: filename }));
            }

            attachments.push(this.chatIcon);

            await this.logChannel.send({ embeds: [messageDelete], files: attachments });

            if (attachments.length === 0) return;

            await this.logChannel.send({ files: attachments });
        });

        this.client.on('messageBulkDelete', async (messages: Collection<Snowflake, Message | PartialMessage>): Promise<void> => {
            Logging.debug('Bulk messages have been deleted!');

            const deletedMessages: any[] = [];

            for (const message of messages.values()) {
                deletedMessages.push({
                    name: `Van: ${message.member?.displayName || message.author?.tag || 'Niet bekend'}`,
                    value: message.content || __('No content'),
                });
            }

            const bulkMessagesDeleted: EmbedBuilder = new EmbedBuilder()
                .setColor(Color.Red)
                .setTitle(__('Bulk messages deleted'))
                .setThumbnail('attachment://chat.png')
                .addFields(...deletedMessages);

            await this.logChannel.send({ embeds: [bulkMessagesDeleted], files: [this.chatIcon] });
        });
    }

    /**
     * Handles all reaction logging
     *
     * @return void
     */
    reactionEvents(): void {
        this.client.on(discordEvents.MessageReactionAdd, async (reaction, user) => {
            if (user.id === this.client.user?.id) return;

            Logging.info('Reaction added to message!');

            const messageReactionAddEmbed: EmbedBuilder = new EmbedBuilder()
                .setColor(Color.Green)
                .setTitle(__('Reaction added'))
                .setDescription(`<placehold>`)
                .setThumbnail('attachment://happy-face.png')
                .addFields(
                    { name: __('User'), value: `<@${user.id}>` },
                    { name: __('Emoji'), value: `${reaction.emoji}` },
                    { name: __('Message'), value: `${reaction.message.url}` }
                );

            await this.logChannel.send({ embeds: [messageReactionAddEmbed], files: [this.reactionIcon] });
        });

        this.client.on(discordEvents.MessageReactionRemove, async (reaction, user) => {
            if (user.id === this.client.user?.id) return;

            Logging.info('Reaction removed to message!');

            const messageReactionAddEmbed: EmbedBuilder = new EmbedBuilder()
                .setColor(Color.Orange)
                .setTitle(__('Reaction removed'))
                .setThumbnail('attachment://happy-face.png')
                .addFields(
                    { name: __('User'), value: `<@${user.id}>` },
                    { name: __('Emoji'), value: `${reaction.emoji}` },
                    { name: __('Message'), value: `${reaction.message.url}` }
                );

            await this.logChannel.send({ embeds: [messageReactionAddEmbed], files: [this.reactionIcon] });
        });
    }

    /**
     * Handles voice channel logging
     *
     * @return void
     */
    voiceChannelEvents(): void {
        this.client.on(discordEvents.VoiceStateUpdate, async (oldState: VoiceState, newState: VoiceState) => {
            // If user joins voice channel
            if (!oldState.channel && newState.channel) {
                const voiceChannelEmbed: EmbedBuilder = new EmbedBuilder()
                    .setColor(Color.Green)
                    .setTitle('Voice kanaal gejoined')
                    .setThumbnail('attachment://microphone.png')
                    .addFields(
                        { name: __('User'), value: `<@${newState.member?.user.id}>` },
                        { name: __('User'), value: `${newState.channel.url}` },
                    );

                await this.logChannel.send({ embeds: [voiceChannelEmbed], files: [this.voiceChatIcon] });
            }

            // If user leaves voice channel
            if (oldState.channel && !newState.channel) {
                Logging.info('A user leaved VC');

                const voiceChannelEmbed: EmbedBuilder = new EmbedBuilder()
                    .setColor(Color.Orange)
                    .setTitle('Voice kanaal verlaten')
                    .setThumbnail('attachment://microphone.png')
                    .addFields(
                        { name: __('User'), value: `<@${oldState.member?.user.id}>` },
                        { name: __('Channel'), value: `${oldState.channel.url}` },
                    );

                await this.logChannel.send({ embeds: [voiceChannelEmbed], files: [this.voiceChatIcon] });
            }

            // If user changes voice channel
            if (oldState.channel && newState.channel) {
                Logging.info('A user changed VC');

                const voiceChannelEmbed: EmbedBuilder = new EmbedBuilder()
                    .setColor(Color.Green)
                    .setTitle('Voice kanaal veranderd')
                    .setThumbnail('attachment://microphone.png')
                    .addFields(
                        { name: __('User'), value: `<@${oldState.member?.user.id}>` },
                        { name: 'Oud:', value: `${oldState.channel.url}` },
                        { name: 'Nieuw:', value: `${newState.channel.url}` },
                    );

                await this.logChannel.send({ embeds: [voiceChannelEmbed], files: [this.voiceChatIcon] });
            }
        });
    }

    /**
     * Handles membership-related events in a Discord server, such as when members join, leave, are banned, unbanned, or updated.
     * Logs the events and sends an embed message to a designated channel with information about the membership event.
     *
     * @return {Promise<void>} Resolves when the events are registered and handled properly.
     */
    async memberEvents(): Promise<void> {
        // On member join is handles by invite tracker

        this.client.on(discordEvents.GuildMemberRemove, async (member: GuildMember|PartialGuildMember): Promise<void> => {
            Logging.info('A user left this Discord!');

            const memberEventEmbed = new EmbedBuilder()
                .setColor(Color.Red)
                .setTitle('Lid verlaten')
                .setThumbnail('attachment://user.png')
                .addFields(
                    { name: __('User'), value: `<@${member.id}>` },
                    { name: 'Lid sinds:', value: `<t:${Math.floor(member.joinedTimestamp ?? 0 / 1000)}:F>` },
                );

            await this.logChannel.send({ embeds: [memberEventEmbed], files: [this.userIcon] });
        });

        this.client.on(discordEvents.GuildBanAdd, async (ban: GuildBan): Promise<void> => {
            Logging.info('A user was banned on this Discord!');

            const fetchBan: GuildBan = await ban.guild.bans.fetch(ban.user.id);
            const auditLogs = await ban.guild.fetchAuditLogs({
                type: AuditLogEvent.MemberBanAdd,
                limit: 1
            });

            const banLog = auditLogs.entries.find(
                entry => entry.target?.id === ban.user.id)
            ;
            const executor: User|null|undefined = banLog?.executor;

            const memberEventEmbed = new EmbedBuilder()
                .setColor(Color.Red)
                .setTitle('Lid gebanned')
                .setThumbnail('attachment://moderation.png')
                .addFields(
                    { name: __('User'), value: `<@${ban.user.id}>` },
                    { name: 'Reden:', value: `${fetchBan.reason ?? 'Geen reden opgegeven'}` },
                    { name: 'Door:', value: executor ? `${executor.username} (<@${executor.id}>)` : 'Onbekend' },
                );

            await this.logChannel.send({ embeds: [memberEventEmbed], files: [this.moderationIcon] });
        });

        this.client.on(discordEvents.GuildBanRemove, async (unBan: GuildBan): Promise<void> => {
            Logging.info('A user was unbanned on this Discord!');

            const auditLogs = await unBan.guild.fetchAuditLogs({
                type: AuditLogEvent.MemberBanAdd,
                limit: 1
            });

            const unBanLog = auditLogs.entries.find(
                entry => entry.target?.id === unBan.user.id)
            ;
            const executor: User|null|undefined = unBanLog?.executor;

            const memberEventEmbed = new EmbedBuilder()
                .setColor(Color.Orange)
                .setTitle('Lid unbanned')
                .setThumbnail('attachment://moderation.png')
                .addFields(
                    { name: __('User'), value: `<@${unBan.user.id}>` },
                    { name: 'Door:', value: executor ? `${executor.username} (<@${executor.id}>)` : 'Onbekend' },
                )

            await this.logChannel.send({ embeds: [memberEventEmbed], files: [this.moderationIcon] });
        });

        this.client.on(discordEvents.GuildMemberUpdate, async (oldMember: GuildMember|PartialGuildMember, newMember: GuildMember): Promise<void> => {
            if (oldMember.displayName === newMember.displayName) return;

            Logging.info('A user was updated in this Discord!');


            const memberEventEmbed = new EmbedBuilder()
                .setColor(Color.Green)
                .setTitle('Lid gebruikersnaam update')
                .setThumbnail('attachment://user.png')
                .addFields(
                    { name: __('User'), value: `<@${newMember.user.id}>` },
                    { name: 'Oud:', value: `${oldMember.displayName ?? 'Niet gevonden'}` },
                    { name: 'Nieuw:', value: `${newMember.displayName ?? 'Niet gevonden'}` },
                );

            await this.logChannel.send({ embeds: [memberEventEmbed], files: [this.userIcon]});
        });
    }
}

