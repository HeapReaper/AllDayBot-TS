import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Client,
    EmbedBuilder,
    Events as discordEvents,
    Message,
    TextChannel,
    ThreadAutoArchiveDuration,
    User,
    StringSelectMenuBuilder,
} from 'discord.js';
import { Logging } from '@utils/logging';
import { getEnv } from '@utils/env.ts';
import QueryBuilder from '@utils/database';
import { Color } from '@enums/colorEnum';

export default class Events {
    private client: Client;
    private readonly modMailChannel: TextChannel;

    constructor(client: Client) {
        this.client = client;
        this.modMailChannel = this.client.channels.cache.get(<string>getEnv('MODMAIL')) as TextChannel;
        this.onMessageEvent();
        this.onSelectEvents();
        this.onButtonsEvents();
    }

    // Event listeners
    onMessageEvent(): void {
        // DM from user to modmail channel
        this.client.on(discordEvents.MessageCreate, async (message: Message): Promise<void> => {
            if (message.author.bot) return;
            if (!message.channel.isDMBased()) return;

            Logging.info('Recieved a DM message!');

            Logging.debug(`${await this.getActiveTicketsCountFromUser(message)}`)

            // Make a new ticket
            if (await this.getActiveTicketsCountFromUser(message) < 1) {
                const ticket = await this.modMailChannel.threads.create({
                    name: `Ticket van ${message.author.displayName}`,
                    autoArchiveDuration: ThreadAutoArchiveDuration.ThreeDays,
                    reason: `Ticket van ${message.author.displayName}`,
                })

                await QueryBuilder
                    .insert('tickets')
                    .values({
                        title: `Ticket van ${message.author.displayName}`,
                        status: 'open',
                        priority: 'low',
                        created_by_user_id: message.author.id,
                        thread_id: ticket.id,
                        due_date: new Date(Date.now() + (3 * 24 * 60 * 60 * 1000))
                            .toISOString()
                            .slice(0, 19)
                            .replace('T', ' ')
                    })
                    .execute();

                const ticketDb: any = await this.getTicketFromDb(message.author.id, 'open');

                await ticket.send({
                    embeds: [this.fromDmToThreadEmbed(message, ticketDb)],
                    // @ts-ignore
                    components: [this.adminSelectPriority(ticketDb), this.adminSelectTicketStatus(ticketDb)]
                });
                return;
            }

            // Add a message to an existing ticket
            const ticketDb: any = await this.getTicketFromDb(message.author.id, 'open');

            try {
                const thread = await this.client.channels.fetch(`${ticketDb.thread_id}`);

                if (!thread || !thread.isThread()) return;
                // @ts-ignore
                await thread.send({
                    embeds: [this.fromDmToThreadEmbed(message, ticketDb)],
                    // @ts-ignore
                    components: [this.adminSelectTicketStatus(ticket)]
                });
            } catch (error) {
                Logging.error(`Error inside onDmEvent: ${error}`);
            }
        });

        // From modmail channel to user
        this.client.on(discordEvents.MessageCreate, async (message: Message): Promise<void> => {
            if (message.author.bot) return;
            if (!message.channel.isThread()) return;
            if (message.channel.parentId !== <string>getEnv('MODMAIL')) return;

            Logging.info(`Recieved a message in the modmail channel!`);

            const ticketDb: any = await this.getTicketFromDb(message.author.id, 'open');


            const user: User = await this.client.users.fetch(ticketDb.created_by_user_id);

            // @ts-ignore
            await user.send({
                embeds: [this.fromThreadToDmEmbed(message, ticketDb)],
                // @ts-ignore
                components: [this.userTicketButtons(ticketDb)]
            });
        });
    }

    onSelectEvents(): void {
        this.client.on(discordEvents.InteractionCreate, async (interaction: any): Promise<void> => {
            if (!interaction.isSelectMenu()) return;

            await interaction.deferUpdate();

            const ticketDb: any = await this.getTicketFromDb(interaction.author.id, 'open');

            if (interaction.customId === 'priority') {
                await this.updateTicketStatusDb(interaction.channel.id, interaction.values[0]);

                const user: User = await this.client.users.fetch(ticketDb.created_by_user_id);
                const thread = await this.client.channels.fetch(`${ticketDb.thread_id}`);

                let embedTitle: string = '';
                let embedDescription: string = '';

                if (interaction.values[0] === 'low') {
                    embedTitle = 'Ticket is gewijzigd!';
                    embedDescription = 'Ticket is gewijzigd naar laag prioriteit.';
                }

                if (interaction.values[0] === 'medium') {
                    embedTitle = 'Ticket is gewijzigd!';
                    embedDescription = 'Ticket is gewijzigd naar medium prioriteit.';
                }

                if (interaction.values[0] === 'high') {
                    embedTitle = 'Ticket is gewijzigd!';
                    embedDescription = 'Ticket is gewijzigd naar hoog prioriteit.';
                }

                await user.send({ embeds: [this.ticketStatusUpdateEmbed(embedTitle, embedDescription)] });
                // @ts-ignore
                await thread?.send({ embeds: [this.ticketStatusUpdateEmbed(embedTitle, embedDescription)] });
            }

            if (interaction.customId === 'status') {
                await this.updateTicketStatusDb(interaction.channel.id, interaction.values[0]);

                // Send a message to user and thread
                const user: User = await this.client.users.fetch(ticketDb.created_by_user_id);
                const thread = await this.client.channels.fetch(`${ticketDb.thread_id}`);
                if (!thread?.isThread()) return;

                let embedTitle: string = '';
                let embedDescription: string = '';

                if (interaction.values[0] === 'closed') {
                    embedTitle = 'Ticket is gesloten!';
                    embedDescription = 'Ticket is gesloten door het bestuur.';
                    await thread.setArchived(true);
                }

                if (interaction.values[0] === 'on_hold') {
                    embedTitle = 'Ticket is on hold!';
                    embedDescription = 'ticket is op on hold gezet door het bestuur.';
                }

                await this.updateTicketStatusDb(interaction.channel.id, interaction.values[0]);

                await user.send({ embeds: [this.ticketStatusUpdateEmbed(embedTitle, embedDescription)] });
                await thread.send({ embeds: [this.ticketStatusUpdateEmbed(embedTitle, embedDescription)] });
            }
        })
    }

    onButtonsEvents(): void {
        this.client.on(discordEvents.InteractionCreate, async (interaction: any): Promise<void> => {
            if (!interaction.isButton()) return;

            await interaction.deferUpdate();

            if (interaction.customId === 'closeTicketUser') {
                const ticketDb = await this.getTicketFromDb(interaction.user.id, 'open');

                await this.updateTicketStatusDb(interaction.channel.id, 'closed');

                const user: User = await this.client.users.fetch(ticketDb.created_by_user_id);
                const thread = await this.client.channels.fetch(`${ticketDb.thread_id}`);

                if (!thread?.isThread()) return;

                await user.send({ embeds: [this.ticketStatusUpdateEmbed('Ticket is gesloten!', 'Ticket is gesloten door het de gebruiker.')] });
                await thread.send({ embeds: [this.ticketStatusUpdateEmbed('Ticket is gesloten!', 'Ticket is gesloten door het de gebruiker.')] });
            }
        })
    }

    async getActiveTicketsCountFromUser(message: Message): Promise<number> {
        return await QueryBuilder
            .select('tickets')
            .where({created_by_user_id: message.author.id, status: 'open'})
            .count()
            .get();
    }

    fromDmToThreadEmbed(message: Message, ticket: any): EmbedBuilder {
        return new EmbedBuilder()
            .setColor(Color.Green)
            .setTitle(`Bericht van ${message.author.displayName}`)
            .setDescription(message.content)
            .setFooter({text: `Ticket status: ${ticket.status}. Prioriteit: ${ticket.priority}.`});
    }

    fromThreadToDmEmbed(message: Message, ticket: any): EmbedBuilder {
        return new EmbedBuilder()
            .setColor(Color.Green)
            .setTitle(`Reactie door bestuur`)
            .setDescription(message.content)
            .setFooter({text: `Ticket status: ${ticket.status}. Prioriteit: ${ticket.priority}.`});
    }

    adminSelectPriority(ticket: any): ActionRowBuilder {
        return new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('priority')
                .setPlaceholder('Prioriteit')
                .addOptions([
                    { label: 'Prioriteit: Laag', value: 'low', default: ticket.priority == 'low' },
                    { label: 'Prioriteit: Medium', value: 'medium', default: ticket.priority == 'medium' },
                    { label: 'Prioriteit: Hoog', value: 'high', default: ticket.priority == 'high' },
                ])
        );
    }

    adminSelectTicketStatus(ticket: any): ActionRowBuilder {
        return new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('status')
                .setPlaceholder('Status')
                .addOptions([
                    { label: 'Status: Open', value: 'open', default: ticket.status == 'open' },
                    { label: 'Status: Gesloten', value: 'closed', default: ticket.status == 'closed' },
                    { label: 'Status: Pauze', value: 'on_hold', default: ticket.status == 'on_hold' }
                ])
        );
    }

    userTicketButtons(): ActionRowBuilder {
        return new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('closeTicketUser')
                .setLabel('Sluit ticket')
                .setStyle(ButtonStyle.Danger)
        )
    };

    ticketStatusUpdateEmbed(title: string, description: string): EmbedBuilder {
        return new EmbedBuilder()
            .setColor(Color.Red)
            .setTitle(title)
            .setDescription(description);
    }

    async getTicketFromDb(id: string, status: string): Promise<any> {
        return await QueryBuilder
            .select('tickets')
            .where({created_by_user_id: id, status: status})
            .first();
    }

    async updateTicketStatusDb(thread_id: string, status: string): Promise<void> {
        await QueryBuilder.update('tickets')
            .set({status: status})
            .where({thread_id: thread_id})
            .execute();
    }
}
