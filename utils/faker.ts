import {
    Client,
    GuildMember,
} from 'discord.js';

export class Faker {
    static memberRemove(memberId: string, client: Client) {
        const fakeMember = {
            user: {
                id: memberId,
                tag: 'fakerMember#0069',
            },
            guild: {
                id: client.guilds.cache.first()?.id,
                systemChannel: null,
            }
        } as unknown as GuildMember;

        client.emit('guildMemberRemove', fakeMember);
    }

    static memberJoin(memberId: string, client: Client) {
        const fakeMember = {
            user: {
                id: memberId,
                tag: 'fakerMember#0069',
            },
            guild: client.guilds.cache.first(),
        } as unknown as GuildMember;

        client.emit('guildMemberAdd', fakeMember);
    }
}