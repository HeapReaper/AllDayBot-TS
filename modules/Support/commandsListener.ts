import {
	Client,
	Events as discordEvents,
	Interaction,
} from 'discord.js';
import {getEnv} from "@utils/env.ts";

export default class CommandsListener {
	private client: Client;
	private forumChannel: any;
	constructor(client: Client) {
		this.client = client;
		this.forumChannel = this.client.channels.cache.get(getEnv('TECH_SUPPORT') as string);
		void this.commandsListener();
	}

	async commandsListener(): Promise<void> {
		this.client.on(discordEvents.InteractionCreate, async (interaction: Interaction): Promise<void> => {
			if (!interaction.isMessageContextMenuCommand()) return;

			switch (interaction.commandName) {
				case 'Verplaats naar support':
					await this.moveToSupport(interaction);
					break;
			}
		});
	}

	async moveToSupport(interaction: any): Promise<void> {
		const message = interaction.targetMessage;

		const thread = await this.forumChannel.threads.create({
			name: `${message.content.slice(0, 55)}...`,
			message: {
				content: `<@${message.author.id}> heeft wat hulp nodig! 👇\n\n__**Orgineel bericht:**__\n${message.content}`,
			},
			appliedTags: [getEnv('NOT_SOLVED') as string],
		});

		const firstMessage = await thread.fetchStarterMessage();

		await interaction.reply({
			content: 'Verplaats...',
			ephemeral: true,
		});

		await message.channel.send(`Hey <@${message.author.id}>, je bent in het verkeerde kanaal! Ik heb je bericht verplaatst naar ${firstMessage.url}`);

		await message.delete();
	}
}