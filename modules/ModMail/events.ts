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

                const ticketDb = await QueryBuilder
                    .select('tickets')
                    .where({created_by_user_id: message.author.id, status: 'open'})
                    .first();

                await ticket.send({
                    embeds: [this.fromDmToThreadEmbed(message, ticketDb)],
                    // @ts-ignore
                    components: [this.adminSelectPriority(ticket), this.adminSelectTicketStatus(ticketDb)]
                });
                return;
            }

            // Add a message to an existing ticket
            const ticket: any = await QueryBuilder
                .select('tickets')
                .where({created_by_user_id: message.author.id, status: 'open'})
                .first();

            Logging.debug(`Ticket ID: ${ticket.thread_id}`);

            try {
                const thread = await this.client.channels.fetch(`${ticket.thread_id}`);

                if (!thread || !thread.isThread()) return;
                // @ts-ignore
                await thread.send({
                    embeds: [this.fromDmToThreadEmbed(message, ticket)],
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

            const ticket = await QueryBuilder
                .select('tickets')
                .where({thread_id: message.channel.id})
                .first();

            const user: User = await this.client.users.fetch(ticket.created_by_user_id);

            // @ts-ignore
            await user.send({
                embeds: [this.fromThreadToDmEmbed(message, ticket)],
                // @ts-ignore
                components: [this.userTicketButtons(ticket)]
            });
        });
    }

    onSelectEvents(): void {
        this.client.on(discordEvents.InteractionCreate, async (interaction: any): Promise<void> => {
            if (!interaction.isSelectMenu()) return;

            if (interaction.customId === 'priority') {
                const ticket: any = await QueryBuilder
                    .select('tickets')
                    .where({thread_id: interaction.channel.id})
                    .first();

                if (!ticket) return;
            }

            if (interaction.customId === 'status') {
                await interaction.deferUpdate();

                const ticket: any = await QueryBuilder
                    .select('tickets')
                    .where({thread_id: interaction.channel.id})
                    .first();

                if (!ticket) return;

                await QueryBuilder
                    .update('tickets')
                    .set({status: interaction.values[0]})
                    .where({thread_id: interaction.channel.id})
                    .execute();

                // Send a message to user and thread
                const user: User = await this.client.users.fetch(ticket.created_by_user_id);
                const thread = await this.client.channels.fetch(`${ticket.thread_id}`);
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
                    embedDescription = 'ticket is op on hold gezet door het bestuur. Je hoort nog van ons terug.';
                }

                if (interaction.values[0] === 'in_progress') {
                    embedTitle = 'Ticket is bezig!';
                    embedDescription = 'Ticket is op bezig gezet door het bestuur. Je hoort van ons terug.';
                }

                await QueryBuilder.update('tickets')
                    .set({status: interaction.values[0]})
                    .where({thread_id: interaction.channel.id})
                    .execute();

                await user.send({ embeds: [this.ticketStatusUpdateEmbed(embedTitle, embedDescription)] });
                await thread.send({ embeds: [this.ticketStatusUpdateEmbed(embedTitle, embedDescription)] });
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
                    { label: 'Status: Bezig', value: 'in_progress', default: ticket.status == 'in_progress' },
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
}
