import ICommand from "../utils/ICommand";
import discord from 'discord.js';
import VotePackManager, { VotePackType } from "../managers/VotePackManager";
import EmbedHelper from "../helpers/EmbedHelper";
import ServerManager from "../managers/ServerManager";
import WebApi from "../utils/WebApi";
import SongManager from "../managers/SongManager";
import InteractionHelper from "../helpers/InteractionHelper";
import FunctionUtils from "../utils/FunctionUtils";
import MaxSongsManager from "../managers/MaxSongsManager";
import RadioBot from "../RadioBot";
import RadiobotDiscord from "../discord/RadiobotDiscord";

const AddCommand: ICommand = {
    name: "add",
    description: "Adds a song to your server.",
    run: async (m: discord.Message, args: string[]): Promise<void> => {
        const server = ServerManager.getInstance().getServerById(m.guildId);
        if (!server) return;

        if (server.getSongs().length >= server.getMaxSongs()) {
            if (VotePackManager.getInstance().hasVotePack(m.author.id, VotePackType.SongSlot)) {
                const r = await m.reply({ embeds: [ EmbedHelper.Premium(m.guild.name + " already has the maximum number of songs (" + server.getMaxSongs() + "), but you can redeem your RadioPack type `" + VotePackType.SongSlot + "`" +
                                    " to get an extra slot for this server. React to the message to continue, wait to cancel.").setFooter("You have " + VotePackManager.getInstance().getVotePacksByUserId(m.author.id, VotePackType.SongSlot) + " RadioPack(s) type " + VotePackType.SongSlot) ]});

                if (!(await InteractionHelper.awaitConfirmation(r, m.author.id))) return;

                VotePackManager.getInstance().removeVotePack(m.author.id, VotePackType.SongSlot);
                MaxSongsManager.getInstance().incrementServerMaxSongs(server.getId());
                RadiobotDiscord.getInstance().sendStatus(m.author.username + " (" + m.author.id + ") just used a RadioPack `" + VotePackType.SongSlot + "`");
            } else {
                m.reply({ embeds: [ EmbedHelper.NOK(m.guild.name + " already has the maximum number of songs (" + server.getMaxSongs() + ")") ]});
                return;
            }
        }
        
        if (args.length < 1) {
            m.reply({ embeds: [ EmbedHelper.NOK("Usage: " + server.getPrefix() + "add [video url] [optional: song name]") ]});
            return;
        }

        const videoUrl = args.shift();
        let songName = args.join(" ") || "";

        if (!(await WebApi.validateVideo(videoUrl))) {
            m.reply({ embeds: [ EmbedHelper.NOK("Please enter a valid video link.") ]});
            return;
        }

        if (songName.length > 0) {
            songName = FunctionUtils.sanitizeStringForBd(songName);
        }

        if (songName.length > 50) {
            m.reply({ embeds: [ EmbedHelper.NOK("Maximum length for song name is 50 characters.") ]});
            return;
        }

        const videoInfo = await WebApi.getVideoInfo(videoUrl, ["lengthSeconds", "videoId", "title"]);
        const lengthInSeconds = parseInt(videoInfo.get('lengthSeconds'));
        const videoId = videoInfo.get('videoId');
        const videoTitle = videoInfo.get('title');

        if (songName.length <= 0) {
            songName = FunctionUtils.sanitizeStringForBd(videoTitle.substring(0, 49));
        }

        if (lengthInSeconds >= 600 || lengthInSeconds == 0) {
            if (VotePackManager.getInstance().hasVotePack(m.author.id, VotePackType.LongerSong) && lengthInSeconds <= 1200 && lengthInSeconds > 0) {
                const r = await m.reply({ embeds: [ EmbedHelper.Premium("To add songs longer than 10 minutes you need to redeem a RadioPack type `" + VotePackType.LongerSong + "`." + 
                                        " React to the message to continue, wait to cancel.").setFooter("You have " + VotePackManager.getInstance().getVotePacksByUserId(m.author.id, VotePackType.LongerSong) + " RadioPack(s) of type " + VotePackType.LongerSong) ]});

                if (!(await InteractionHelper.awaitConfirmation(r, m.author.id))) return;
                
                VotePackManager.getInstance().removeVotePack(m.author.id, VotePackType.LongerSong);
                RadiobotDiscord.getInstance().sendStatus(m.author.username + " (" + m.author.id + ") just used a RadioPack `" + VotePackType.LongerSong + "`");
            } else if (VotePackManager.getInstance().hasVotePack(m.author.id, VotePackType.AnyLengthLiveVideo)) {
                const r = await m.reply({ embeds: [ EmbedHelper.Premium("You need to redeem a RadioPack type `" + VotePackType.AnyLengthLiveVideo + "` to add a song of this length." +
                                        " React to the message to continue, wait to cancel.").setFooter("You have " + VotePackManager.getInstance().getVotePacksByUserId(m.author.id, VotePackType.AnyLengthLiveVideo) + " RadioPack(s) of type " + VotePackType.AnyLengthLiveVideo) ]});

                if (!(await InteractionHelper.awaitConfirmation(r, m.author.id))) return;

                VotePackManager.getInstance().removeVotePack(m.author.id, VotePackType.AnyLengthLiveVideo);
                RadiobotDiscord.getInstance().sendStatus(m.author.username + " (" + m.author.id + ") just used a RadioPack `" + VotePackType.AnyLengthLiveVideo + "`");
            } else {
                m.reply({ embeds: [ EmbedHelper.NOK("You cannot add songs longer than 10 minutes (psst, use " + server.getPrefix() + "vote)") ]});
                return;
            }
        }

        const confirmation = await m.reply({ embeds: [ EmbedHelper.Info("You are about to add [" + songName + "](" + videoUrl + ")." + 
                                        " React to the message to confirm, wait to cancel.") ]});

        if (!(await InteractionHelper.awaitConfirmation(confirmation, m.author.id))) return;

        const song = await SongManager.getInstance().createSong(songName, videoUrl, videoId, server.getId(), lengthInSeconds);
        
        if (song)
            server.addSong(song);

        m.reply({ embeds: [ EmbedHelper.OK('Added song [' + songName + '](' + videoUrl + ') at position `' + server.getSongs().length + '` to ' + m.guild.name + '.') ]});
        RadiobotDiscord.getInstance().sendStatus("new song added in " + RadiobotDiscord.getInstance().resolveGuildNameAndId(server.getGuild()) + ": [" + songName + "](" + videoUrl + ").");
    }
};

export default AddCommand;