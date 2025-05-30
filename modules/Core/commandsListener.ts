import {
    Client,
    Interaction,
    Events as discordEvents,
    ChatInputCommandInteraction
} from 'discord.js';

export default class CommandsListener {
	private client: Client;

	constructor(client: Client) {
		this.client = client;
		void this.commandsListener();
	}
	
    async commandsListener(): Promise<void> {
        this.client.on(discordEvents.InteractionCreate, async (interaction: Interaction): Promise<void> => {
            if (!interaction.isCommand()) return;

            const { commandName } = interaction;

            if (commandName !== 'core') return;

            // @ts-ignore
            const subCommandName: any = interaction.options.getSubcommand();

            switch (subCommandName) {
                case 'status':
                    // @ts-ignore
                    await this.handleStatus(interaction);
                    break;
            }
        });
    }

    async handleStatus(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.reply('Working on it!');
    }
}
