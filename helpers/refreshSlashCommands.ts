import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import fs from 'fs/promises';
import path from 'path';
import { Logging } from '@helpers/logging';
import { getEnv} from '@helpers/env.ts';

async function commandsLoader() {
    const modulesPath: string = path.join(process.cwd(), 'modules');
    const modulesFolder: string[] = await fs.readdir(modulesPath);
    const rest = new REST({version: '10'}).setToken(getEnv('DISCORD_TOKEN')!);
    
    /// Cleaning up old commands
    await rest.put(Routes.applicationGuildCommands(getEnv('CLIENT_ID')!, getEnv('GUILD_ID')!), {
        body: [],
    });
    
    for (const module of modulesFolder) {
        Logging.debug(`Trying to load commands for module: ${module}`);
        const modulePath: string = path.join(modulesPath, module, 'commands.ts');
        
        try {
            const commandsFromModule: any = await import(path.resolve(modulePath));
            
            if (!commandsFromModule.commands) {
                Logging.error(`No commands exported from ${modulePath}`);
                continue;
            }
            
            Logging.debug(`Commands: ${JSON.stringify(commandsFromModule.commands)}`);
            
            await rest.put(Routes.applicationGuildCommands(getEnv('CLIENT_ID')!, getEnv('GUILD_ID')!), {
                body: commandsFromModule.commands,
            });
            
            Logging.info(`Successfully registered commands for module: ${module}`);
        } catch (error) {
            Logging.error(`Failed to load commands for module: ${module} - ${error}`);
        }
    }
}


void commandsLoader()