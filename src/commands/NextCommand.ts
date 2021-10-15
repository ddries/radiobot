import ICommand from "../utils/ICommand";
import discord from 'discord.js';
import ServerManager, { ServerState } from "../managers/ServerManager";
import EmbedHelper from "../helpers/EmbedHelper";

const NextCommand: ICommand = {
    name: "next",
    aliases: ["skip", "n"],
    description: "Plays the next song in the song list while queue is enabled.",
    run: (m: discord.Message, args: string[]): void => {
        const server = ServerManager.getInstance().getServerById(m.guildId);
        if (!server) return;

        if (!server.getSongs() || server.getSongs().length <= 0) {
            m.reply({ embeds: [ EmbedHelper.NOK("There aren't any songs yet!\nUse `" + server.getPrefix() + "add`.") ]});
            return;
        }

        if (server.getState() != ServerState.Playing && server.getState() != ServerState.Paused) {
            m.reply({ embeds: [ EmbedHelper.NOK("There has to be something playing first (" + server.getPrefix() + "song)") ]});
            return;
        }

        const nextSong = server.getNextSongInQueue();
        if (!nextSong) return;

        server.setPlayingSongId(nextSong.getId());

        m.reply({ embeds: [ EmbedHelper.OK("Playing [" + nextSong.getName() + "](" + nextSong.getUrl() + ")") ]});

        server.joinVoice();
        server.startPlay(false);
    }
};

export default NextCommand;