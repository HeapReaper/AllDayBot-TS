import { Client,
    TextChannel,
    Events as discordEvents,
} from 'discord.js';

export default class Events {
    private client: Client;

    constructor(client: Client) {
        this.client = client;
        this.welcomeMessage()
    }

    welcomeMessage(): void {
        //
    }
}
