// modules/Leveling/commands.js

import { Logging } from "../../helpers/logging.js";

class LevelingCommands {
    constructor(client) {
        this.client = client;
        this.setupCommands();
    }

    setupCommands() {
        this.client.on('messageCreate', message => {
            if (message.author.bot) return;

            if (message.content === '!ping') {
                message.channel.send('Pongdiedong!');
            }
        });

        Logging.debug(`Initialized Leveling commands`);
    }
}

export default function (client) {
    new LevelingCommands(client);
}