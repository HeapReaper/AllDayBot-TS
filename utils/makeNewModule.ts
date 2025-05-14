import { mkdirSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import * as process from 'node:process';

// TODO: Add cron to tasks

if (process.argv.slice(2).length == 0) {
	console.error('Please specify the module name you weirdo!');
	process.exit();
}

const modulesDir = `./modules`;
const moduleNameToCreate = process.argv.slice(2)[0];

console.log(`Making module named ${moduleNameToCreate} inside ${modulesDir}/`);

if (existsSync(`${modulesDir}/${moduleNameToCreate}`)) {
	console.error(`Module named ${moduleNameToCreate} already exists!`);
	process.exit();
}

// Making modules folder
mkdirSync(`${modulesDir}/${moduleNameToCreate}`);

const commandsFileWrite =
`import { SlashCommandBuilder } from 'discord.js';

export const commands = [

].map(commands => commands.toJSON());
`;

const commandsListenerFileWrite =
`import { Client, Interaction, Events, MessageFlags} from 'discord.js';

export default class CommandsListener {
	private client: Client;

	constructor(client: Client) {
		this.client = client;
		void this.commandsListener();
	}
	
	async commandsListener(): Promise<void> {
		//
	}
}
`;

const eventsFileWrite =
`import { Client, TextChannel } from 'discord.js';

export default class Events {
    private client: Client;

    constructor(client: Client) {
        this.client = client;
    }
}
`;

const tasksFileWrite =
`import { Client, TextChannel } from 'discord.js';

export default class Tasks {
	private client: Client;

    constructor(client: Client) {
		this.client = client;
	}
}
`;

// Making and writing module files
writeFileSync(`${modulesDir}/${moduleNameToCreate}/commands.ts`, commandsFileWrite);
writeFileSync(`${modulesDir}/${moduleNameToCreate}/commandsListener.ts`, commandsListenerFileWrite);
writeFileSync(`${modulesDir}/${moduleNameToCreate}/events.ts`, eventsFileWrite);
writeFileSync(`${modulesDir}/${moduleNameToCreate}/tasks.ts`, tasksFileWrite);

console.log('I created the module!');