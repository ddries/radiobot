import ICommand from "../utils/ICommand";
import discord from 'discord.js';
import ServerManager, { ServerState } from "../managers/ServerManager";
import EmbedHelper from "../helpers/EmbedHelper";
import PrefixManager from "../managers/PrefixManager";

const SongCommand: ICommand = {
    name: "song",
    aliases: ["s"],
    description: "Changes the playing song in your server.",
    run: (m: discord.Message, args: string[]): void => {
        const server = ServerManager.getInstance().getServerById(m.guildId);
        if (!server) return;

        if (!server.getSongs() || server.getSongs().length <= 0) {
            m.reply({ embeds: [ EmbedHelper.NOK("There aren't any songs yet!\nUse `" + server.getPrefix() + "add`.") ]});
            return;
        }

        if (!m.member.voice.channelId) {
            if (server.getChannelId().length <= 0) {
                m.reply({ embeds: [ EmbedHelper.NOK("Please specify a channel using `" + server.getPrefix() + "channel [name / part of name]` or run the command from a voice channel.") ]});
                return;
            }
        } else {
            if (server.getState() == ServerState.Disconnected || server.getChannelId().length <= 0) {
                server.setChannelId(m.member.voice.channelId);
                const channelName = server.getGuild().channels.cache.get(server.getChannelId())?.name;
                if (channelName) {
                    m.reply({ embeds: [ EmbedHelper.Info("Automatically set channel to `" + channelName + "`") ]});
                }
            }
        }

        if (args.length <= 0 || isNaN(parseInt(args[0]))) {
            m.reply({ embeds: [ EmbedHelper.NOK("Usage: `" + server.getPrefix() + "song [number]`") ]});
            return;
        } else {
            const index = parseInt(args[0]) - 1;

            if (index < 0) {
                m.reply({ embeds: [ EmbedHelper.NOK("Index must greater than 1.") ]});
                return;
            }

            const song = server.getSongAt(index);
            
            if (!song) {
                m.reply({ embeds: [ EmbedHelper.NOK("Couldn't find song at that index!") ]});
                return;
            }

            server.setPlayingSongId(song.getId());

            m.reply({ embeds: [ EmbedHelper.OK("Playing [" + song.getName() + "](" + song.getUrl() + ").") ]});

            server.joinVoice();
            server.startPlay(false);
        }
    }
}

export default SongCommand;