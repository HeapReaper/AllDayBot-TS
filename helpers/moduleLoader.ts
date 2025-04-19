import fs from 'fs/promises';
import path from 'path';
import { pathToFileURL } from 'url';
import { Logging } from '@helpers/logging';
import { getEnv } from '@helpers/env';

async function loadModules(client: any) {
    let modulesPath: string;
    let moduleFolders: string[] = [];

    try {
        modulesPath = path.join(<string>getEnv('MODULES_BASE_PATH'), 'modules');
        moduleFolders = await fs.readdir(modulesPath);
    } catch (error) {
        Logging.error(`Error loading modules in moduleLoader: ${error}`);
        return;
    }

    for (const moduleFolder of moduleFolders) {
        const modulePath = path.join(modulesPath, moduleFolder);

        // Loading commands file
        const commandsFile = path.join(modulePath, 'commands.ts');

        try {
            await fs.access(commandsFile);

            const commandsURL = pathToFileURL(commandsFile).href;
            const commands = await import(commandsURL);

            if (!commands.default) continue;

            new commands.default(client);
            Logging.debug(`Loaded commands for module: ${moduleFolder}`);
        } catch (error) {
            Logging.error(`Error loading commands for module '${moduleFolder}', ${error}`);
        }

        // Loading commandsListener file
        const commandsListenerFile = path.join(modulePath, 'commandsListener.ts');

        try {
            await fs.access(commandsListenerFile);

            const commandsListenerURL = pathToFileURL(commandsListenerFile).href;
            const commandsListeners = await import(commandsListenerURL);

            if (!commandsListeners.default) continue;

            new commandsListeners.default(client);
            Logging.debug(`Loaded commandsListener for module: ${moduleFolder}`);
        } catch (error) {
            Logging.error(`Error loading commandsListener for module '${moduleFolder}', ${error}`);
        }

        // Loading events file
        const eventsFile = path.join(modulePath, 'events.ts');

        try {
            await fs.access(eventsFile);

            const eventsURL = pathToFileURL(eventsFile).href;
            const events = await import(eventsURL);

            if (!events.default) continue;

            new events.default(client);
            Logging.debug(`Loaded events for event '${eventsFile}'`);
        } catch (error) {
            Logging.error(`Error loading events for module '${moduleFolder}', ${error}`);
        }

        // Loading tasks file
        const tasksFile = path.join(modulePath, 'tasks.ts');

        try {
            await fs.access(tasksFile);

            const tasksURL = pathToFileURL(tasksFile).href;
            const tasks = await import(tasksURL);

            if (!tasks.default) continue;

            new tasks.default(client);
            Logging.debug(`Loaded tasks for task '${tasksFile}'`);
        } catch (error) {
            Logging.error(`Error loading tasks for task '${tasksFile}', ${error}`);
        }
        Logging.info(`Loaded module '${moduleFolder}': ${modulePath}`);
    }
}

export default loadModules;