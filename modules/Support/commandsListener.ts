import {
	Client,
	Interaction,
	Events,
	MessageFlags,
	PermissionsBitField,
	ThreadChannel,
} from 'discord.js';
import { Logging } from '@utils/logging';
import { getEnv } from '@utils/env';

export default class CommandsListener {
	private client: Client;

	constructor(client: Client) {
		this.client = client;
		void this.commandsListener();
	}
	
	async commandsListener(): Promise<void> {
		this.client.on(Events.InteractionCreate, async (interaction: Interaction) => {
			if (!interaction.isCommand()) return;

			const { commandName } = interaction;
			// @ts-ignore
			const subCommandName: any = interaction.options.getSubcommand();

			switch (subCommandName) {
				case 'opgelost':
					void this.solved(interaction);
					break;
			}
		})
	}

	async solved(interaction: Interaction): Promise<void> {
		if (!interaction.isCommand()) return;

		if (!interaction.channel?.isThread()) {
			Logging.warn(`User ${interaction.user.username} tried to run this command outside a thread!`);

			await interaction.reply({
				content: 'Je mag dit command niet buiten threads gebruiken!',
				flags: MessageFlags.Ephemeral
			});
		}

		const member = await interaction.guild?.members.fetch(interaction.user.id);

		if (!member) {
			Logging.warn(`User ${interaction.user.username} could not be checked for permissions!`);

			await interaction.reply({
				content: 'Ik kon je permissions niet controleren!',
				flags: MessageFlags.Ephemeral,
			})
			return;
		}
		const thread = interaction.channel as ThreadChannel;
		const isThreadOwner: boolean = thread?.ownerId === interaction.user.id;
		const hasManageMessages: boolean = member
			.permissionsIn(thread?.parent!)
			.has(PermissionsBitField.Flags.ManageMessages);

		if (!isThreadOwner && !hasManageMessages) {
			Logging.warn(`User ${interaction.user.username} tried to run this command without permissions!`);

			await interaction.reply({
				content: 'Je hebt niet de rechten om dit command uit te voeren hier!',
				flags: MessageFlags.Ephemeral,
			})
			return;
		}

		if (thread.parent?.type != 15 ) {
			Logging.warn(`User ${interaction.user.username} tried to run this command somewhere where
			 the parent aint a forum channel!`);

			await interaction.reply({
				content: 'Dit command wordt niet op de juiste plek gebruikt!',
				flags: MessageFlags.Ephemeral,
			})
			return;
		}

		const tagId: string = <string>getEnv('SOLVED')

		if (!tagId) {
			Logging.warn('I tried solving a thread post but no tagId was found in solved');
			return;
		}

		await thread.setAppliedTags([tagId]);

		await interaction.reply({
			content: `Opgelost! Thread gesloten door door ${interaction.user.username}` // TODO: embed or canvas
		});

		await thread.setArchived(true, `Opgelost! Thread gesloten door ${interaction.user.username}`);
	}
}

