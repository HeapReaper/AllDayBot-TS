import fs from 'fs/promises';
import path from 'path';
import { pathToFileURL } from 'url';
import { Logging } from './logging.js';

async function loadModules(client) {
    const modulesPath = path.join('./', 'modules');

    try {
        const moduleFolders = await fs.readdir(modulesPath);
        for (const moduleFolder of moduleFolders) {
            const modulePath = path.join(modulesPath, moduleFolder);

            // Loading commands file
            const commandsFile = path.join(modulePath, 'commands.js');

            try {
                await fs.access(commandsFile);

                const commandsURL = pathToFileURL(commandsFile).href;
                const commands = await import(commandsURL);

                if (commands.default) {
                    await commands.default(client);
                    Logging.debug(`Loaded commands for module: ${moduleFolder}`);
                }
            } catch (error) {
                Logging.error(`Error loading commands for module '${moduleFolder}', ${error}`);
            }

            // Loading events file
            const eventsFile = path.join(modulePath, 'events.js');

            try {
                await fs.access(eventsFile);

                const eventsURL = pathToFileURL(eventsFile).href;
                const events = await import(eventsURL);

                if (events.default) {
                    await events.default(client);
                    Logging.debug(`Loaded events for event '${eventsFile}'`);
                }
            } catch (error) {
                Logging.error(`Error loading events for module '${moduleFolder}', ${error}`);
            }

            // Loading tasks file
            const tasksFile = path.join(modulePath, 'tasks.js');

            try {
                await fs.access(tasksFile);

                const tasksURL = pathToFileURL(tasksFile).href;
                const tasks = await import(tasksURL);

                if (tasks.default) {
                    await tasks.default(client);
                    Logging.debug(`Loaded tasks for task '${tasksFile}'`);
                }
            } catch (error) {
                Logging.error(`Error loading tasks for task '${tasksFile}', ${error}`);
            }
            Logging.info(`Loaded module '${moduleFolder}': ${modulePath}`);
        }



    } catch (error) {
        Logging.error(
            `Error reading modules directory: ${modulesPath}: ${error.message}`
        );
    }
}

export default loadModules;