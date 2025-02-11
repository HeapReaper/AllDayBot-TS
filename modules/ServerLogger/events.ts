// modules/ServerLogger/events.ts

import { Client, Events as discordEvents, Message, EmbedBuilder, TextChannel } from 'discord.js';
import { Logging } from '@helpers/logging.ts';
import { Color } from '@enums/colorEnum';
import { getEnv } from '@helpers/env.ts';

export default class Events {
    private client: Client;

    constructor(client: Client) {
        this.client = client;
        this.messageEvents();
    }

    messageEvents(): void {
        // @ts-ignore temp
        this.client.on(discordEvents.MessageUpdate, async (oldMessage: Message, newMessage: Message): Promise<void> => {
            Logging.debug('An message has been edited!');

            const messageUpdateEmbed: any = new EmbedBuilder()
                .setColor(Color.Orange)
                .setTitle('Bericht bewerkt!')
                .setDescription(`Bericht link: ${oldMessage.url}`)
                .setAuthor({
                    name: oldMessage.author.displayName,
                    iconURL: oldMessage.author.displayAvatarURL(),
                    url: oldMessage.author.displayAvatarURL()
                })
                .addFields(
                    { name: 'test', value: 'test' },
                );

            // @ts-ignore
            ( this.client.channels.cache.get(getEnv('ALL_DAY_LOG') as TextChannel )).send({ embeds: [messageUpdateEmbed] });
        });
    }


    // member join
    // member remove
    // member ban
    // member unban
    // member update (nickname change)

    // voice join
    // voice leave
    // voice change

    // message delete
    // bulk message delete
    // message edit

    // reaction add
    // reaction remove
}

