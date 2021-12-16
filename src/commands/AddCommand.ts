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
import RadiobotDiscord from "../discord/RadiobotDiscord";
import PremiumManager from "../managers/PremiumManager";

const AddCommand: ICommand = {
    name: "add",
    description: "Adds a song to your server.",
    run: async (m: discord.Message, args: string[]): Promise<void> => {
        const server = ServerManager.getInstance().getServerById(m.guildId);
        if (!server) return;
        
        if (args.length < 1) {
            m.reply({ embeds: [ EmbedHelper.NOK("Usage: " + server.getPrefix() + "add [video url] [optional: song name]") ]});
            return;
        }

        // If the server already has the max number of songs,
        // the user can redeem a Radiopack to increase the max

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

        const videoUrl = args.shift();
        let songName = args.join(" ") || "";

        // The link must be a valid youtube video

        if (!(await WebApi.validateVideo(videoUrl))) {
            m.reply({ embeds: [ EmbedHelper.NOK("Please enter a valid video link.") ]});
            return;
        }

        // We apply regex filters to sanitize the song name,
        // Db crashes and bugs are not funny :(

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

        // If no song name was given by the user,
        // we use the video title.
        // But we have to sanitize it first

        if (songName.length <= 0) {
            songName = FunctionUtils.sanitizeStringForBd(videoTitle.substring(0, 49));
        }

        // If the song is longer than 10 minutes or it is live video
        // we need to perform more checks

        if (lengthInSeconds >= 600 || lengthInSeconds == 0) {

            // If the user is premium
            // fuck off, they can do whatever they want

            if (!PremiumManager.getInstance().getUserIsPremium(m.author.id)) {

                // If the song is shorter than 20 minutes and longer than 10 minutes,
                // the user can redeem a Radiopack to add the song

                if (VotePackManager.getInstance().hasVotePack(m.author.id, VotePackType.LongerSong) && lengthInSeconds <= 1200 && lengthInSeconds > 0) {
                    const r = await m.reply({ embeds: [ EmbedHelper.Premium("To add songs longer than 10 minutes you need to redeem a RadioPack type `" + VotePackType.LongerSong + "`." + 
                                            " React to the message to continue, wait to cancel.").setFooter("You have " + VotePackManager.getInstance().getVotePacksByUserId(m.author.id, VotePackType.LongerSong) + " RadioPack(s) of type " + VotePackType.LongerSong) ]});

                    if (!(await InteractionHelper.awaitConfirmation(r, m.author.id))) return;
                    
                    VotePackManager.getInstance().removeVotePack(m.author.id, VotePackType.LongerSong);
                    RadiobotDiscord.getInstance().sendStatus(m.author.username + " (" + m.author.id + ") just used a RadioPack `" + VotePackType.LongerSong + "`");
                
                // If the song is a live video
                // and the server has no available slots for live videos,
                // the user can redeem a Radiopack to add the song

                } else if (lengthInSeconds == 0 && server.getNumberOfLiveVideos() >= 1 && PremiumManager.getInstance().getUserIsPremium(m.author.id)) {
                    const r = await m.reply({ embeds: [ EmbedHelper.Premium("You need to redeem a RadioPack type `" + VotePackType.AnyLengthLiveVideo + "` to add more live videos." +
                                            " React to the message to continue, wait to cancel.").setFooter("You have " + VotePackManager.getInstance().getVotePacksByUserId(m.author.id, VotePackType.AnyLengthLiveVideo) + " RadioPack(s) of type " + VotePackType.AnyLengthLiveVideo) ]});                  

                    if (!(await InteractionHelper.awaitConfirmation(r, m.author.id))) return;

                // If the song is longer than 20 minutes,
                // the user can redeem a Radiopack to add the song

                } else if (lengthInSeconds > 0 && VotePackManager.getInstance().hasVotePack(m.author.id, VotePackType.AnyLengthLiveVideo)) {
                    const r = await m.reply({ embeds: [ EmbedHelper.Premium("You need to redeem a RadioPack type `" + VotePackType.AnyLengthLiveVideo + "` to add a song of this length." +
                                            " React to the message to continue, wait to cancel.").setFooter("You have " + VotePackManager.getInstance().getVotePacksByUserId(m.author.id, VotePackType.AnyLengthLiveVideo) + " RadioPack(s) of type " + VotePackType.AnyLengthLiveVideo) ]});

                    if (!(await InteractionHelper.awaitConfirmation(r, m.author.id))) return;

                    VotePackManager.getInstance().removeVotePack(m.author.id, VotePackType.AnyLengthLiveVideo);
                    RadiobotDiscord.getInstance().sendStatus(m.author.username + " (" + m.author.id + ") just used a RadioPack `" + VotePackType.AnyLengthLiveVideo + "`");

                // If the song is a live video and there are no available slots
                // and the user has no Radiopack,
                // we give him more info about the reason
                
                } else if (lengthInSeconds == 0 && server.getNumberOfLiveVideos() >= 1 && !PremiumManager.getInstance().getUserIsPremium(m.author.id)) {
                    m.reply({ embeds: [ EmbedHelper.NOK(m.guild.name + " doesn't have any available live video slots. You need to be Premium to add more.") ]});
                    return;

                // If the user is unable to add the song
                // and it's not a live video,
                // we redirect him to voting
                
                } else if (lengthInSeconds > 0) {
                    m.reply({ embeds: [ EmbedHelper.NOK("You cannot add songs longer than 10 minutes (psst, use " + server.getPrefix() + "vote)") ]});
                    return;
                }
            }
        }

        // Otherwise, the song can be added to the server

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