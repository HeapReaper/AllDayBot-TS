// modules/Leveling/tasks.js

import { Logging } from "../../helpers/logging.js";

class LevelingTasks {
    constructor(client) {
        this.client = client;
        this.startTestTask();
    }

    startTestTask() {
        setInterval(() => {
            console.log('test');
        }, 10000);
    }
}

export default function (client) {
    new LevelingTasks(client);
}