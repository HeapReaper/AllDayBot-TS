import { Client,
	Interaction,
	Events,
	Channel,
	MessageFlags,
} from 'discord.js';
import { Logging } from '@utils/logging';

export default class CommandsListener {
	private client: Client;

	constructor(client: Client) {
		this.client = client;
		void this.commandsListener();
	}
	
	async commandsListener(): Promise<void> {
		this.client.on(Events.InteractionCreate, async (interaction: Interaction): Promise<void> => {
			if (!interaction.isCommand()) return;

			// @ts-ignore
			const subcommand = interaction.options.getSubcommand();

			if (!subcommand) return;

			switch (subcommand) {
				case 'moeilijk_doen':
					Logging.info(`User ${interaction.user.username} used /community moeilijk_doen`);
					void this.sendEmbed(interaction, 'Niet zo moeilijk doen, we helpen je als we kunnen. Totdat we een mooi contract tekenen en je ons gaat betalen, zijn we je niets verplicht.');
					break;
				case 'dm':
					Logging.info(`User ${interaction.user.username} used /community dm`);
					void this.sendEmbed(interaction, 'Dat hoeft helemaal niet in een DM dus doe maar gewoon hier... kunnen andere mensen ook helpen.');
					break;
				case 'kanaal':
					Logging.info(`User ${interaction.user.username} used /community kanaal`);
					// @ts-ignore
					void this.sendEmbed(interaction, `Gelieve het juiste kanaal te gebruik, in dit geval is dat ${interaction.options.getChannel('kanaal')}.`);
					break;
				case 'vraag':
					Logging.info(`User ${interaction.user.username} used /community vraag`);
					void this.sendEmbed(interaction, 'Stel gewoon je vraag, vraag niet om te vragen.');
					break;
			}
		})
	}

	async sendEmbed(interaction: Interaction, message: string): Promise<void> {
		const channel: Channel|null = await this.client.channels.fetch(interaction.channel?.id ?? '');

		if (!channel || !interaction.isCommand() || !channel.partial) return;

		await interaction.reply({
			content: 'Ik heb het gestuurd!',
			flags: MessageFlags.Ephemeral,
		});

		// @ts-ignore
		await channel.send(`${interaction.options.getUser('gebruiker')}\n${message}`);
	}
}
