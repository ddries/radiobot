
var core = require('./../core/core.js');

function addSongProcess(m) {
    core.discord.notify(core.discord.NotifyType.Info, m.channel, {
        description: "Enter the name of the song you want to add."
    });

    core.waitForUserResponse(m.author, m.channel, 0, songName => {
        if (songName.length > 50) {
            core.discord.notify(core.discord.NotifyType.Error, m.channel, {
                description: "Maximum song name length is 50 characters."
            });
            return;
        }

        core.logs.log('Trying to get through API ' + songName, "ADD-NAME", core.logs.LogFile.DOWNLOAD_LOG);
        core.request(core.API_WRAPPER_URL + "validate?u=" + encodeURIComponent(songName), (err, resp, body) => {
            if (resp.statusCode === 200) {
                core.discord.notify(core.discord.NotifyType.Error, m.channel, {
                    description: "You introduced a Youtube link for the song name. Remember this is the name and not the link of the song."
                });
            } else if (resp.statusCode === 400) {
                songName = songName.replace(/[^\x00-\x7F]/g, "").replace(/[\\$'"]/g, "\\$&");
                core.discord.notify(core.discord.NotifyType.Success, m.channel, {
                    description: "Established song name to **" + songName + "**. Enter the Youtube link (with `https://`) of the song."
                });

                core.waitForUserResponse(m.author, m.channel, 0, songUrl => {
                    if (!songUrl.startsWith('https://')) {
                        core.discord.notify(core.discord.NotifyType.Error, m.channel, {
                            description: "The Youtube URL must start with `https://`."
                        });
    
                        core.clearUserWaitingForResponse(m.guild.id);
                        return;
                    }
    
                    core.logs.log('Trying to get through API ' + songUrl, "ADD-URL", core.logs.LogFile.DOWNLOAD_LOG);
                    core.request(core.API_WRAPPER_URL + "validate?u=" + encodeURIComponent(songUrl), (err, resp, body) => {
                        if (resp.statusCode === 400) {
                            core.discord.notify(core.discord.NotifyType.Error, m.channel, {
                                description: "The URL must be a valid Youtube link."
                            });
                        } else if (resp.statusCode === 200) {
                            core.logs.log('Trying to get through API INFO ' + songUrl, "ADD-INFO", core.logs.LogFile.DOWNLOAD_LOG);
                            core.request(core.API_WRAPPER_URL + "info?f=lengthSeconds,videoId&u=" + encodeURIComponent(songUrl), (err, resp, body) => {
                                if (resp.statusCode !== 200) {
                                    m.reply("there has been an error while executing this command (API Wrapper). Please contact developers with " + core.getServerPrefix(m.guild.id) + "report.");
                                    core.clearUserWaitingForResponse(m.guild.id);
                                    return;
                                }
                                
                                body = JSON.parse(body);
                                
                                if (body.lengthSeconds >= 600 || body.lengthSeconds == 0) {
                                    if (core.userHasPack(m.author.id, 0) && body.lengthSeconds <= 1200) {
                                        m.reply("the song is longer than 10 minutes, but you can redeem your pack type **0** to add it (You have **" + core.getUserPackAmount(m.author.id, 0) + "**). Type yes/y to continue, or anything else to cancel.");
                                        core.waitForUserResponse(m.author, m.channel, 0, confirm => {
                                            if (confirm == "yes" || confirm == "y") {
                                                core.removeUserPack(m.author.id, 0);
                                                core.discord.sendWebhook(m.author.username + " (" + m.author.id + ") just used a **PACK 0**");
                                                core.addSongToServer([songName, songUrl], m.guild.id, body.videoId, true);
            
                                                core.totalSongs++;

                                                core.discord.notify(core.discord.NotifyType.Success, m.channel, {
                                                    description: "Your song **" + songName + "** has been added to " + m.guild.name + "! You can play it with **" + core.getServerPrefix(m.guild.id) + "song**.",
                                                    title: songName,
                                                    url: songUrl
                                                });
                                
                                                core.discord.sendWebhook("New song added in **" + m.guild.name + "** (" + m.guild.id + "): [" + songName + "](" + songUrl + ").");
                                            } else {
                                                core.discord.notify(core.discord.NotifyType.Error, m.channel, {
                                                    description: "Operation was cancelled"
                                                });
                                                return;
                                            }
                                        });
                                    } else {
                                        if (core.userHasPack(m.author.id, 4)) {
                                            m.reply("you need to redeem a pack type **4** (You have **" + core.getUserPackAmount(m.author.id, 4) + "**) to add a song of this length. Type yes/y to continue, or anything else to cancel.");
                                            core.waitForUserResponse(m.author, m.channel, 0, confirm => {
                                                if (confirm == 'yes' || confirm == 'y') {
                                                    core.removeUserPack(m.author.id, 4);
                                                    core.discord.sendWebhook(m.author.username + " (" + m.author.id + ") just used a **PACK 4**");
                                                    
                                                    core.addSongToServer([songName, songUrl, true], m.guild.id, body.videoId, true);
                                                }
                                            });
                                        }
                                        core.discord.notify(core.discord.NotifyType.Error, m.channel, {
                                            description: "You can't add songs longer than 10 minutes (psst, use `" + core.getServerPrefix(m.guild.id) + "vote`)"
                                        });
                
                                        return;
                                    }   
                                } else {
                                    core.addSongToServer([songName, songUrl], m.guild.id, body.videoId, true);
            
                                    core.totalSongs++;

                                    core.discord.notify(core.discord.NotifyType.Success, m.channel, {
                                        description: "Your song **" + songName + "** has been added to " + m.guild.name + "! You can play it with **" + core.getServerPrefix(m.guild.id) + "song**.",
                                        title: songName,
                                        url: songUrl
                                    });
                    
                                    core.discord.sendWebhook("New song added in **" + m.guild.name + "** (" + m.guild.id + "): [" + songName + "](" + songUrl + ").");   
                                }
                            });
                        } else {
                            m.reply("there has been an error while executing this command (API Wrapper). Please contact developers with " + core.getServerPrefix(m.guild.id) + "report.");
                        }
                    });
                });
            } else {
                m.reply("there has been an error while executing this command (API Wrapper). Please contact developers with " + core.getServerPrefix(m.guild.id) + "report");
            }
        });
        
        if (core.ytdl.validateURL(songName)) {
            core.discord.notify(core.discord.NotifyType.Error, m.channel, {
                description: "You introduced a Youtube link for the song name. Remember this is the name and not the link of the song."
            });
            return;
        }
    });
}

module.exports = {
    name: "add",
    alias: ["a"],
    description: "Adds a song to your server.",
    execute: (m, args, discord) => {
        if (core.getUserWaitingForResponse(m.guild.id).length > 0) {
            core.discord.notify(core.discord.NotifyType.Error, m.channel, {
                description: "I'm already waiting for somebody to respond, please wait."
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
                        addSongProcess(m);
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

        addSongProcess(m);
    }
};