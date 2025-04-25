import {
	Client,
	Interaction,
	Events as discordEvents,
	MessageFlags,
	EmbedBuilder,
} from 'discord.js';
import QueryBuilder from '@utils/database.ts';
import { Logging } from '@utils/logging';
import { Color } from '@enums/colorEnum.ts';

export default class CommandsListener {
	private client: Client;

	constructor(client: Client) {
		this.client = client;
		void this.commandsListener();
	}
	
	async commandsListener(): Promise<void> {
		this.client.on(discordEvents.InteractionCreate, async (interaction) => {
			if (!interaction.isCommand()) return;
			if (!interaction.isChatInputCommand()) return;

			const { commandName } = interaction;
			const subCommandName = interaction.options.getSubcommand();

			if (commandName !== 'invites') return;

			switch (subCommandName) {
				case 'lijst':
					await this.listInvitesEmbed(interaction);
					break;
				case 'toevoegen':
					await this.addInvite(interaction);
					break;
				case 'verwijderen':
					await this.deleteInvite(interaction);
					break;
			}
		})
	}

	async listInvitesEmbed(interaction: Interaction): Promise<void> {
		if (!interaction.isChatInputCommand()) return;

		try {
			const invites = await QueryBuilder
				.select('invite_tracker')
				.get();

			const inviteTrackerEmbed: EmbedBuilder = new EmbedBuilder()
				.setColor(Color.AdtgPurple)
				.setTitle('Invite tracker')
				.setDescription(`Zie alle invite trackers`)

			for (const invite of invites) {
				inviteTrackerEmbed.addFields(
					{ name: 'Naam / Gebruikt', value: `${invite.invite_name} / ${invite.uses}`, inline: true },
					{ name: 'Code', value: `${invite.invite_code}`, inline: true },
					{ name: 'Eigenaar', value: `<@${invite.inviter_id}>`, inline: true },
				)
			}

			await interaction.reply({embeds: [inviteTrackerEmbed]});
		} catch (error) {
			Logging.error(`Error getting invite tracker list: ${error}`);
			await interaction.reply(`Oeps! Er ging iets mis: ${error}`);
		}
	}

	async addInvite(interaction: Interaction): Promise<void> {
		if (!interaction.isChatInputCommand()) return;

		try {
			await QueryBuilder
				.insert('invite_tracker')
				.values({
					invite_name: interaction.options.getString('naam'),
					inviter_id: `${interaction.options.getUser('invite_eigenaar')?.id}`,
					invite_code: interaction.options.getString('invite_code'),
					added_by_user_id: interaction.user.id
				})
				.execute();

			// @ts-ignore
			await interaction.reply({
				content: 'De invite is toegevoegd! Gebruik `/invites lijst` om ze te zien.',
				ephemeral: true,
			});
		} catch (error) {
			Logging.error(`Error adding invite tracker: ${error}`);
			await interaction.reply(`Oeps! Er ging iets mis: ${error}`);
		}
	}

	async deleteInvite(interaction: Interaction): Promise<void> {
		if (!interaction.isChatInputCommand()) return;

		try {
			await QueryBuilder
				.delete('invite_tracker')
				.where({ invite_naam: `${interaction.options.getString('invite_naam')}`})
				.execute();

			await interaction.reply({
				content: `Invite met de naam ${interaction.options.getString('invite_naam')} is verwijderd.`,
				ephemeral: true,
			});
		} catch (error) {
			Logging.error(`Error adding invite tracker: ${error}`);
			await interaction.reply(`Oeps! Er ging iets mis: ${error}`);
		}
	}
}
