
var core = require('./../core/core.js');

function addSongProcess(m, songUrl) {
    core.logs.log('Trying to get through API INFO ' + songUrl, "PLAY-INFO", core.logs.LogFile.DOWNLOAD_LOG);
    core.request(core.API_WRAPPER_URL + "info?f=lengthSeconds,videoId,title&u=" + encodeURIComponent(songUrl), (err, resp, body) => {
        if (resp.statusCode !== 200 && resp.statusCode !== 400) {
            m.reply("there has been an error while executing this command (API Wrapper). Please contact developers with " + core.getServerPrefix(m.guild.id) + "report.");
            return;
        } else if (resp.statusCode === 400) {
            core.discord.notify(core.discord.NotifyType.Error, m.channel, {
                description: "USAGE: " + core.getServerPrefix(m.guild.id) + "play [Youtube URL]"
            });
            return;
        }
        
        body = JSON.parse(body);
        songName = body.title.length > 50 ? body.title.substring(0, 49) : body.title;

        if (body.lengthSeconds >= 600 || body.lengthSeconds == 0) {
            if (core.userHasPack(m.author.id, 0) && body.lengthSeconds <= 1200) {
                m.reply("the song is longer than 10 minutes, but you can redeem your pack type **0** to add it (You have **" + core.getUserPackAmount(m.author.id, 0) + "**). Type yes/y to continue, or anything else to cancel.");
                core.waitForUserResponse(m.author, m.channel, 0, confirm => {
                    if (confirm == "yes" || confirm == "y") {
                        core.removeUserPack(m.author.id, 0);
                        core.discord.sendWebhook(m.author.username + " (" + m.author.id + ") just used a **PACK 0**");
                        
                        core.addSongToServer([songName, songUrl], m.guild.id, body.videoId, true, id => {
                            core.totalSongs++;

                            core.discord.notify(core.discord.NotifyType.Success, m.channel, {
                                title: "Playing " + songName,
                                url: songUrl,
                                description: "The song has been added to this server's list. You may check it with " + core.getServerPrefix(m.guild.id) + "list (" + core.getServerSongs(m.guild.id).length + "/" + core.getServerMaxSongs(m.guild.id) + ")."
                            });
            
                            core.discord.sendWebhook("New song added with `play` in **" + m.guild.name + "** (" + m.guild.id + "): [" + songName + "](" + songUrl + ").");
    
                            let serSongs = core.getServerSongs(m.guild.id);
                            let song = serSongs[serSongs.length - 1];
    
                            let nueva = core.getCurrentlyPlayingSongInServer(m.guild.id).length <= 0;
                            core.setCurrentlyPlayingSongInServer(m.guild.id, song, true);
    
                            core.logs.log("Changed song playing from " + m.guild.id + " to (ID) " + song[0], "COMMON", core.logs.LogFile.COMMON_LOG);
                            core.joinVoiceChannel(m.client, m.guild.id, nueva, true);
                        });
                    } else {
                        core.discord.notify(core.discord.NotifyType.Error, m.channel, {
                            description: "Operation was cancelled"
                        });
                        return;
                    }
                });
            } else {
                core.discord.notify(core.discord.NotifyType.Error, m.channel, {
                    description: "You can't add songs longer than 10 minutes (psst, use `" + core.getServerPrefix(m.guild.id) + "vote`)"
                });

                return;
            }   
        } else {
            core.addSongToServer([songName, songUrl], m.guild.id, body.videoId, true, id => {
                core.totalSongs++;

                core.discord.notify(core.discord.NotifyType.Success, m.channel, {
                    title: "Playing " + songName,
                    url: songUrl,
                    description: "The song has been added to this server's list. You may check it with " + core.getServerPrefix(m.guild.id) + "list (" + core.getServerSongs(m.guild.id).length + "/" + core.getServerMaxSongs(m.guild.id) + ")."
                });
    
                core.discord.sendWebhook("New song added with `play` in **" + m.guild.name + "** (" + m.guild.id + "): [" + songName + "](" + songUrl + ").");
    
                let serSongs = core.getServerSongs(m.guild.id);
                let song = serSongs[serSongs.length - 1];
    
                let nueva = core.getCurrentlyPlayingSongInServer(m.guild.id).length <= 0;
                core.setCurrentlyPlayingSongInServer(m.guild.id, song, true);
    
                core.logs.log("Changed song playing from " + m.guild.id + " to (ID) " + song[0], "COMMON", core.logs.LogFile.COMMON_LOG);
                core.joinVoiceChannel(m.client, m.guild.id, nueva, true);
            });
        }
    });
}

module.exports = {
    name: "play",
    description: "Plays the specified song url and adds it to the server list.",
    execute: (m, args, discord) => {
        if (core.getUserWaitingForResponse(m.guild.id).length > 0) {
            core.discord.notify(core.discord.NotifyType.Error, m.channel, {
                description: "I'm already waiting for somebody to respond, please wait."
            });

            return;
        }

        if (args.length <= 0) {
            core.discord.notify(core.discord.NotifyType.Error, m.channel, {
                description: "USAGE: " + core.getServerPrefix(m.guild.id) + "play [song url]"
            });
            return;
        }

        if (core.getServerSongs(m.guild.id).length >= core.getServerMaxSongs(m.guild.id)) {
            if (core.userHasPack(m.author.id, 1)) {
                m.reply(m.guild.name + " already has the maximum number of songs added (" + core.getServerMaxSongs(m.guild.id) + "), but you can redeem your pack type **1** (You have **" + core.getUserPackAmount(m.author.id, 1) + "**)" + 
                " to get an extra slot for this server. Type yes/y to continue, or anything else to cancel.");
                core.waitForUserResponse(m.author, m.channel, 0, confirm => {
                    if (confirm == "yes" || confirm == "y") {
                        core.removeUserPack(m.author.id, 1);
                        core.discord.sendWebhook(m.author.username + " (" + m.author.id + ") just used a **PACK 1**");
                        core.setServerMaxSongs(m.guild.id, core.getServerMaxSongs(m.guild.id) + 1, true);
                        addSongProcess(m, args[0]);
                    } else {
                        core.discord.notify(core.discord.NotifyType.Error, m.channel, {
                            description: "Operation was cancelled"
                        });
                        return;
                    }
                });
                return;
            }
            core.discord.notify(core.discord.NotifyType.Error, m.channel, {
                description: m.guild.name + " already has the maximum number of songs added (" + core.getServerMaxSongs(m.guild.id) + ")"
            });

            return;
        }

        addSongProcess(m, args[0]);
    }
};