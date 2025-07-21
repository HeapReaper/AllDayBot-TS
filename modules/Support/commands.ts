import {ApplicationCommandType, ContextMenuCommandBuilder} from 'discord.js';

export const commands = [
  new ContextMenuCommandBuilder()
    .setName('Verplaats naar support')
    .setType(ApplicationCommandType.Message)
].map(commands => commands.toJSON());
