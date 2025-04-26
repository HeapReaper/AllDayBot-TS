import { Client,
    TextChannel,
    Events as discordEvents,
} from 'discord.js';
import QueryBuilder from '@utils/database';
import { getEnv } from '@utils/env';
import { Logging } from '@utils/logging';

export default class Events {
    private client: Client;
    private channelGeneral: TextChannel;

    constructor(client: Client) {
        this.client = client;
        this.channelGeneral = this.client.channels.cache.get(<string>getEnv('GENERAL')) as TextChannel;
        this.welcomeMessage();
    }

    welcomeMessage(): void {
        this.client.on(discordEvents.GuildMemberUpdate, async (oldMember, newMember) => {
            if (!newMember.pending && oldMember.pending) return;

            await this.channelGeneral.send(`Welkom <@${newMember.user.id}> in All Day Tech & Gaming!\n\nIn onze server maken we gebruik van verschillende kanalen om onderwerpen gescheiden te houden:\n- Ben je opzoek naar hulp, dan kan je in <#1019678705045471272> een forum bericht starten.\n- Babbelen over alles wat met tech te maken heeft? <#723556858820034612>\n- Gesprekken met betrekking tot games? <#759456512165937183>\nMocht je vragen hebben m.b.t. het beheer dan kun je {self.bot.user.mention} DM'en!`
            )
        });
    }
}
