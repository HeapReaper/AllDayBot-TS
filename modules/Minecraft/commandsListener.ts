import { Client,
		 Interaction,
		 Events,
		 ChatInputCommandInteraction,
} from 'discord.js';
import QueryBuilder from '@helpers/database';
import { Logging } from '@helpers/logging';
import { getEnv } from '@helpers/env.ts';
import util, { JavaStatusResponse } from 'minecraft-server-util';
import { CanvasBuilder } from '@helpers/canvasBuilder';
import path from 'path';

// TODO: Refactor to use https://discordapp.com/channels/1038516673315078154/1038837019008323584/1358495590719295499
export default class CommandsListener {
	private client: Client;
	
	constructor(client: Client) {
		this.client = client;
		void this.commandListener();
	}
	
	async commandListener(): Promise<void> {
		this.client.on(Events.InteractionCreate, async (interaction: Interaction): Promise<void> => {
			if (!interaction.isCommand()) return;
			
			const { commandName } = interaction;
			// @ts-ignore
			const subCommandName: any = interaction.options.getSubcommand();
			
			if (commandName !== 'minecraft') return;
			
			switch (subCommandName) {
				case 'whitelist':
					void this.whitelist(interaction);
					break;
				case 'verwijder_whitelist':
					void this.whitelistDelete(interaction);
					break;
				case 'online':
					void this.getOnlineUsers(interaction);
					break;
			}
		});
	}

	/**
	 * Processes the 'whitelist' command to add or update a user's Minecraft username.
	 * in the database.
	 * @param interaction
	 * @return Promise<void> - Returns nothing.
	 */
	async whitelist(interaction: Interaction): Promise<void> {
		if (!interaction.isCommand()) return;
		
		const commandInteraction = interaction as unknown as ChatInputCommandInteraction;
		const options = commandInteraction.options;

		const builder = new CanvasBuilder(355, 80);

		await builder.setFixedBackground(path.resolve(__dirname, '..', '..' , 'src', 'media', 'mc.jpg'), 420, 760);

		const textColor = '#ffffff';
		const titleFont = 'bold 24px sans-serif';
		const descriptionFont = '16px sans-serif';

		builder.drawText('Minecraft', 20, 30, titleFont, textColor);

		try {
			const resp: Response = await fetch(`https://api.mojang.com/users/profiles/minecraft/${options.getString('gebruikersnaam')}`)
			const mcUsernameInDbCount: any = await QueryBuilder
				.select('minecraft')
				.where({user_id: interaction.user.id})
				.count()
				.execute()

			if (resp.status === 404 ) {
				Logging.warn(`I didn't found Minecraft username ${options.getString('gebruikersnaam')}`);

				builder.drawText('Je gebruikersnaam is niet gevonden!', 20, 60, descriptionFont, textColor)
				await interaction.reply({files: [builder.getBuffer()]})
			}
			
			if (resp.status !== 200) {
				Logging.error(`Error inside Minecraft whitelist command listener: ${resp.status}`);
				return
			}
			
			// @ts-ignore
			if (mcUsernameInDbCount === 0) {
				await QueryBuilder
					.insert('minecraft')
					.values({user_id: interaction.user.id, minecraft_username: options.getString('gebruikersnaam')})
					.execute();

				builder.drawText('Je gebruikersnaam is toegevoegd!', 20, 60, descriptionFont, textColor)
				await interaction.reply({files: [builder.getBuffer()]})
			} else {
				await QueryBuilder.update('minecraft')
					.set({minecraft_username: options.getString('gebruikersnaam')})
					.where({user_id: interaction.user.id})
					.execute();

				builder.drawText('Je gebruikersnaam is aangepast!', 20, 60, descriptionFont, textColor)
				await interaction.reply({files: [builder.getBuffer()]})
			}
			
			Logging.info(`Added the Minecraft username ${options.getString('gebruikersnaam')} to the database.`);
		} catch (error) {
			await interaction.reply('Oeps! Er ging iets mis! Het probleem is gerapporteerd aan de developer.');
			Logging.error(`Error checking Minecraft username: ${error}`);
		}
	}

	/**
	 * Processes the 'whitelist' command to delete a user's Minecraft username.
	 * from the database.
	 * @param interaction
	 * @return Promise<void> - Returns nothing.
	 */
	async whitelistDelete(interaction: Interaction): Promise<void> {
		if (!interaction.isCommand()) return;

		try {
			const builder = new CanvasBuilder(355, 100);

			await builder.setFixedBackground(path.resolve(__dirname, '..', '..' , 'src', 'media', 'mc.jpg'), 420, 760);

			const textColor = '#ffffff';
			const titleFont = 'bold 24px sans-serif';
			const descriptionFont = '16px sans-serif';

			builder.drawText('Minecraft', 20, 30, titleFont, textColor);
			builder.drawText('Je gebruikersnaam is verwijderd\nuit de whitelist!', 20, 60, descriptionFont, textColor)

			await QueryBuilder
				.delete('minecraft')
				.where({user_id: interaction.user.id})
				.execute();
			await interaction.reply({files: [builder.getBuffer()]});
			Logging.info(`A minecraft username has been deleted successfully.`);
		} catch (error) {
			await interaction.reply('Oeps! Er ging iets mis! Het probleem is gerapporteerd aan de developer.');
			Logging.error(`Error deleting Minecraft username: ${error}`);
		}
	}

	/**
	 * Gets the online users and calls createMcCanvas to make the canvas.
	 * @param interaction
	 * @returns Promise<void> - Returns nothing.
	 */
	async getOnlineUsers(interaction: Interaction): Promise<void> {
		if (!interaction.isCommand()) return;

		try {
			const promises: Promise<JavaStatusResponse>[] = [
				util.status(<string>getEnv('MC_IP'), parseInt(<string>getEnv('MC_LOBBY_PORT'))),
				util.status(<string>getEnv('MC_IP'), parseInt(<string>getEnv('MC_SURVIVAL_PORT'))),
				util.status(<string>getEnv('MC_IP'), parseInt(<string>getEnv('MC_CREATIVE_PORT'))),
				util.status(<string>getEnv('MC_IP'), parseInt(<string>getEnv('MC_MINIGAMES_PORT'))),
			];

			const results: PromiseSettledResult<JavaStatusResponse>[] = await Promise.allSettled(promises);

			const canvasBuffer = await this.createMcCanvas(
				`Lobby ${this.getServerName(results[0])}`, this.getPlayerValueCanvas(results[0]),
				`Survival ${this.getServerName(results[1])}`, this.getPlayerValueCanvas(results[1]),
				`Creative ${this.getServerName(results[2])}`, this.getPlayerValueCanvas(results[2]),
				`MiniGames ${this.getServerName(results[3])}`, this.getPlayerValueCanvas(results[3])
			);

			await interaction.reply({files: [canvasBuffer]});
		} catch (error) {
			await interaction.reply('Er ging iets mis! Probleem is gerapporteerd aan de developer.');
			Logging.error(`Error getting in Minecraft getOnlineUsers command listener: ${error}`);
		}
	}

	/**
	 * Creates the Minecraft canvas with.
	 * player count, player names and server status.
	 * @param lobbyName
	 * @param lobbyPlayers
	 * @param survivalName
	 * @param survivalPlayers
	 * @param creativeName
	 * @param creativePlayers
	 * @param minigamesName
	 * @param minigamesPlayers
	 * @return Promise<Buffer> - The embed
	 */
	async createMcCanvas(
		lobbyName: string, lobbyPlayers: Array<any>,
		survivalName: string, survivalPlayers: Array<any>,
		creativeName: string, creativePlayers: Array<any>,
		minigamesName: string, minigamesPlayers: Array<any>
	): Promise<Buffer> {
		let totalOnlinePlayers = lobbyPlayers.concat(survivalPlayers, creativePlayers, minigamesPlayers);
		let defaultHeight = 325;

		for (let i: number = 0; i < totalOnlinePlayers.length; i++) {
			defaultHeight += 25
		}

		const builder = new CanvasBuilder(300, defaultHeight);

		await builder.setFixedBackground(path.resolve(__dirname, '..', '..' , 'src', 'media', 'mc.jpg'), 420, 760);
		await builder.drawImg(path.resolve(__dirname, '..', '..', 'src', 'media', 'adtg.png'), 170, 4, 120, 120)


		const textColor = '#ffffff';
		const titleFont = 'bold 24px sans-serif';
		const descriptionFont = '16px sans-serif';
		const serverFont = 'bold 18px sans-serif';
		const playersFont = '16px sans-serif';

		builder.drawText('Minecraft', 20, 30, titleFont, textColor);
		builder.drawText('Zie wie online is!', 20, 60, descriptionFont, textColor);

		const serverData = [
			{ name: lobbyName, players: lobbyPlayers },
			{ name: survivalName, players: survivalPlayers },
			{ name: creativeName, players: creativePlayers },
			{ name: minigamesName, players: minigamesPlayers },
		];

		let yOffset = 90;
		serverData.forEach(server => {
			yOffset += 30;
			builder.drawText(server.name, 20, yOffset, serverFont, textColor);
			yOffset += 25;

			if (server.players.length === 0) {
				builder.drawText('Geen spelers online.', 20, yOffset, playersFont, '#99aab5');
			} else {
				server.players.forEach(player => {
					builder.drawText(player.trim(), 20, yOffset, playersFont, '#99aab5');
					yOffset += 20;
				});
			}

			yOffset += 5;
		});

		return builder.getBuffer();
	}

	/**
	 * Creates the server title count and fills in the player count.
	 * Sets it to 0 if server is offline. Else fill in the current player count.
	 * @param server
	 * @return string - Server count
	 */
	getServerName(server: any): string {
		return `[${server.status === 'fulfilled' || undefined ? server.value.players.online : '0'}/10]`
	}

	/**
	 * Makes the value of players for a server.
	 * @param server any
	 * @return Array<any> - Player names or Server is offline
	 */
	getPlayerValueCanvas(server: any): Array<any> {
		return server.status === 'fulfilled'
			? server.value.players.online
				? server.value.players.sample.map((p: any) => p.name)
				: []
			: ['Server is offline'];
	}
}