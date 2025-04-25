import {
	Client,
	Interaction,
	Events as discordEvents,
	MessageFlags
} from 'discord.js';
import QueryBuilder from '@utils/database.ts';
import { Logging } from '@utils/logging';

export default class CommandsListener {
	private client: Client;

	constructor(client: Client) {
		this.client = client;
		void this.commandsListener();
	}
	
	async commandsListener(): Promise<void> {
		this.client.on(discordEvents.InteractionCreate, async (interaction) => {
			if (!interaction.isCommand()) return;

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
		//
	}

	async addInvite(interaction: Interaction): Promise<void> {
		try {
			await QueryBuilder
				.insert('invite_tracker')
				.values({
					invite_name: interaction.options.getString('naam'),
					inviter_id: `${interaction.options.getUser('invite_eigenaar').id}`,
					invite_code: interaction.options.getString('invite_code'),
					added_by_user_id: interaction.user.id
				})
				.execute();

			// @ts-ignore
			await interaction.reply({
				content: 'Is toegevoegd! Gebruik `/invites lijst` om ze te zien.',
				ephemeral: true,
			});
		} catch (error) {
			Logging.error(`Error adding invite tracker: ${error}`);
		}
	}

	async deleteInvite(interaction: Interaction): Promise<void> {
		//
	}
}
