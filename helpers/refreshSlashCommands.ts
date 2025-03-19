// helpers/refresh_slash_commands

import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';


export class RefreshSlashCommands {
    static async refresh(commands: Array<any>): Promise<void> {
        const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN!);
        try {
            const response = await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID!, process.env.GUILD_ID!), {
                body: commands,
            });
            console.log('Slash commands refreshed:', response);
        } catch (error) {
            console.error('Error refreshing slash commands:', error);
        }
    }
}