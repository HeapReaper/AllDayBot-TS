import {
	Client,
	Interaction,
	Events as discordEvents,
	MessageFlags
} from 'discord.js';

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

	async addInvite(interaction: Interaction) {
		//
	}

	async deleteInvite(interaction: Interaction) {
		//
	}
}
