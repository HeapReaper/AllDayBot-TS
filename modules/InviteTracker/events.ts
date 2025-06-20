import {
    Client,
    TextChannel,
    Events as discordEvents,
    GuildMember,
    EmbedBuilder,
    Guild,
    Invite,
    Collection, AttachmentBuilder,
} from 'discord.js';
import { getEnv } from '@utils/env';
import { Logging } from '@utils/logging.ts';
import { Color } from '@enums/colorEnum.ts';
import QueryBuilder from '@utils/database.ts';

export default class InviteTracker {
    private client: Client;
    private invites = new Collection();
    private userIcon: AttachmentBuilder;
    private logChannel: any;

    constructor(client: Client) {
        this.client = client;
        this.logChannel = this.client.channels.cache.get(<string>getEnv('ALL_DAY_LOG')) as TextChannel;
        this.userIcon = new AttachmentBuilder(`${<string>getEnv('MODULES_BASE_PATH')}src/media/icons/user.png`);
        void this.initializeInvites();
        this.onMemberJoin();
        this.onInviteCreate();
    }

    private async initializeInvites() {
        const guild: Guild = await this.client.guilds.fetch(<string>getEnv('GUILD_ID'));
        const guildInvites= await guild.invites.fetch();

        this.invites.set(
            guild.id,
            new Collection(guildInvites.map((
                invite) =>
                [invite.code, invite.uses]
            ))
        );
    }

    onMemberJoin(): void {
        this.client.on(discordEvents.GuildMemberAdd, async (member: GuildMember) => {
            Logging.info(`A new member has joined!`);

            const guild: Guild = member.guild;
            const newInvites = await guild.invites.fetch();
            const oldGuildInvites = this.invites.get(guild.id) as Collection<string, number>;

            const embed = new EmbedBuilder()
                .setColor(Color.Green)
                .setTitle('Nieuw lid')
                .setThumbnail('attachment://user.png')
                .addFields(
                    { name: 'Gebruiker:', value: `<@${member.id}>` },
                    { name: 'Lid sinds:', value: `<t:${Math.floor((member.joinedTimestamp ?? 0) / 1000)}:F>` },
                    { name: 'Lid nummer:', value: `#${member.guild.memberCount}` }
                );

            let usedInvite: Invite | null = null;

            for (const [code, newInvite] of newInvites) {
                const oldUses = oldGuildInvites?.get(code) ?? 0;
                if (newInvite.uses && newInvite.uses > oldUses) {
                    usedInvite = newInvite;
                    break;
                }
            }

            if (usedInvite) {
                const inviteTracker = await QueryBuilder
                    .select('invite_tracker')
                    .columns(['invite_name', 'inviter_id', 'uses'])
                    .where({ invite_code: usedInvite.code })
                    .first();

                await QueryBuilder
                    .update('invite_tracker')
                    .set({ uses: inviteTracker.uses += 1 })
                    .where({ invite_code: usedInvite.code })
                    .execute();

                embed.addFields({ name: 'Invite naam:', value: inviteTracker ? inviteTracker.invite_name : usedInvite.code });
                embed.addFields({ name: 'Invite eigenaar:', value: inviteTracker ? `<@${(await this.client.users.fetch(inviteTracker.inviter_id)).id}>` : 'Niet gevonden' });
            }

            await this.logChannel.send({ embeds: [embed], files: [this.userIcon] });

            this.invites.delete(guild.id);
            await this.initializeInvites();


        });
    }

    onInviteCreate() {
        this.client.on(discordEvents.InviteCreate, (invite: Invite) => {
            this.invites.set(invite.code, invite);
        });
    }
}
