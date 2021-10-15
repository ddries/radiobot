import discord from 'discord.js';
import EmbedHelper from '../helpers/EmbedHelper';
import InteractionHelper from '../helpers/InteractionHelper';
import ServerManager from '../managers/ServerManager';
import ICommand from '../utils/ICommand';

const RemoveCommand: ICommand = {
    name: "remove",
    aliases: ["rm"],
    description: "Remove the specified song from your server",
    run: async (m: discord.Message, args: string[]): Promise<void> => {
        const server = ServerManager.getInstance().getServerById(m.guildId);
        if (!server) return;

        if (args.length <= 0) {
            m.reply({ embeds: [ EmbedHelper.NOK("Usage: " + server.getPrefix() + "remove [song number]") ]});
            return;
        }

        const index = parseInt(args[0]) - 1;

        if (isNaN(index)) {
            m.reply({ embeds: [ EmbedHelper.NOK("Given index must be a valid number.") ]});
            return;
        }

        const song = server.getSongAt(index);
        if (!song) {
            m.reply({ embeds: [ EmbedHelper.NOK("Could not find any song with that index!") ]});
            return;
        }

        const r = await m.reply({ embeds: [ EmbedHelper.Info("You are about to remove [" + song.getName() + "](" + song.getUrl() + ")." +
                            " React to the message to continue, wait to cancel.") ]});

        if (!(await InteractionHelper.awaitConfirmation(r, m.author.id))) return;

        const isCurrentSong = server.getPlayingSongId() == server.getSongAt(index)?.getId();
        const nextSong = server.getNextSongInQueue();

        if (server.removeSong(song))
            m.reply({ embeds: [ EmbedHelper.OK("Successfully removed [" + song.getName() + "](" + song.getUrl() + ").") ]});

        if (isCurrentSong) {
            server.setPlayingSongId(nextSong.getId());

            server.joinVoice();
            server.startPlay(false);
        }
    }
};

export default RemoveCommand;