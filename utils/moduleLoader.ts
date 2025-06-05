import fs from 'fs/promises';
import path from 'path';
import { pathToFileURL } from 'url';
import { Logging } from '@utils/logging';
import { getEnv } from '@utils/env';
import { JsonHelper } from '@utils/json';

export default async function loadModules(client: any) {
    let modulesPath: string;
    let moduleFolders: string[] = [];

    try {
        modulesPath = path.join(<string>getEnv('MODULES_BASE_PATH'), 'modules');
        Logging.debug(`Modules base path resolved to: ${modulesPath}`);
        moduleFolders = await fs.readdir(modulesPath);
    } catch (error) {
        Logging.error(`Error loading modules in moduleLoader: ${error}`);
        return;
    }

    for (const moduleFolder of moduleFolders) {
        Logging.debug(`Processing module folder: ${moduleFolder}`);

        const jsonFilePath = path.join(<string>getEnv('MODULES_BASE_PATH'), 'modules.json');
        Logging.debug(`Loading modules.json from: ${jsonFilePath}`);

        const moduleJson = await JsonHelper
            .file(jsonFilePath)
            .get(moduleFolder);

        Logging.debug(`moduleJson for ${moduleFolder}: ${JSON.stringify(moduleJson)}`);

        if (moduleJson === undefined) {
            Logging.error(`I did not find module ${moduleFolder} inside modules.json! Please add it.`);
            continue;
        }

        if (moduleJson !== true) {
            Logging.info(`Module ${moduleFolder} is disabled in modules.json`);
            continue;
        }

        let moduleLoaded = false;
        Logging.info('Loading module: ' + moduleFolder);
        const modulePath = path.join(modulesPath, moduleFolder);

        // Load commands.ts
        const commandsFile = path.join(modulePath, 'commands.ts');
        Logging.trace(`Checking for commands file at: ${commandsFile}`);
        try {
            await fs.access(commandsFile);
            const commandsURL = pathToFileURL(commandsFile).href;
            const commandsModule = await import(commandsURL);

            if (!commandsModule.commands) {
                Logging.warn(`commands.ts for module ${moduleFolder} does not export 'commands'`);
            } else {
                Logging.trace(`commands.ts loaded successfully for module: ${moduleFolder}`);
                moduleLoaded = true;
            }
        } catch (error) {
            Logging.warn(`commands.ts not loaded for module '${moduleFolder}': ${(error as Error).message}`);
        }

        // Load commandsListener.ts
        const commandsListenerFile = path.join(modulePath, 'commandsListener.ts');
        Logging.trace(`Checking for commandsListener file at: ${commandsListenerFile}`);
        try {
            await fs.access(commandsListenerFile);
            const commandsListenerURL = pathToFileURL(commandsListenerFile).href;
            const commandsListeners = await import(commandsListenerURL);

            if (!commandsListeners.default) {
                Logging.error(`Module ${moduleFolder} commandsListener.ts does not have a default export`);
            } else {
                new commandsListeners.default(client);
                Logging.trace(`commandsListener.ts initialized for module: ${moduleFolder}`);
                moduleLoaded = true;
            }
        } catch (error) {
            Logging.warn(`commandsListener.ts not loaded for module '${moduleFolder}': ${(error as Error).message}`);
        }

        // Load events.ts
        const eventsFile = path.join(modulePath, 'events.ts');
        Logging.trace(`Checking for events file at: ${eventsFile}`);
        try {
            await fs.access(eventsFile);
            const eventsURL = pathToFileURL(eventsFile).href;
            const events = await import(eventsURL);

            if (!events.default) {
                Logging.error(`Module ${moduleFolder} events.ts does not have a default export`);
            } else {
                new events.default(client);
                Logging.trace(`events.ts initialized for module: ${moduleFolder}`);
                moduleLoaded = true;
            }
        } catch (error) {
            Logging.warn(`events.ts not loaded for module '${moduleFolder}': ${(error as Error).message}`);
        }

        // Load tasks.ts
        const tasksFile = path.join(modulePath, 'tasks.ts');
        Logging.trace(`Checking for tasks file at: ${tasksFile}`);
        try {
            await fs.access(tasksFile);
            const tasksURL = pathToFileURL(tasksFile).href;
            const tasks = await import(tasksURL);

            if (!tasks.default) {
                Logging.error(`Module ${moduleFolder} tasks.ts does not have a default export`);
            } else {
                new tasks.default(client);
                Logging.trace(`tasks.ts initialized for module: ${moduleFolder}`);
                moduleLoaded = true;
            }
        } catch (error) {
            Logging.warn(`tasks.ts not loaded for module '${moduleFolder}': ${(error as Error).message}`);
        }

        if (moduleLoaded) {
            Logging.info(`Loaded module '${moduleFolder}' successfully`);
        } else {
            Logging.warn(`⚠Module '${moduleFolder}' did not load any components`);
        }
    }
}