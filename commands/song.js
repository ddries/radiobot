
var core = require('./../core/core.js');

module.exports = {
    name: "song",
    alias: ["s"],
    description: "Changes the playing song in your server.",
    execute: (m, args, discord, client) => {
        if (!core.getServerSongs(m.guild.id) || core.getServerSongs(m.guild.id).length <= 0) {
            core.discord.notify(core.discord.NotifyType.Error, m.channel, {
                description: "There aren't any songs added in " + m.guild.name + " yet! Try adding some with **" + core.discord.DISCORD_PREFIX + "add**"
            });
            return;
        }

        let channel = core.getServerChannel(m.guild.id);
        if (!m.member.voice.channelID) {
            if (!channel || channel.length <= 0) {
                core.discord.notify(core.discord.NotifyType.Error, m.channel, {
                    description: "I'm not configured in this server yet! `" + core.discord.DISCORD_PREFIX + "channel [name / part of name]` or join a voice channel and use `" + core.discord.DISCORD_PREFIX + "song` again"
                });
    
                return;
            }
        } else {
            if (core.isServerDisconnected(m.guild.id) || (!channel || channel.length <= 0)) {
                core.setServerChannel(m.guild.id, m.member.voice.channelID, true);
                client.channels.fetch(m.member.voice.channelID).then(c => {
                    core.discord.notify(core.discord.NotifyType.Success, m.channel, {
                        description: "Automatically updated fixed channel to **" + c.name + "**. You can change it with `" + core.discord.DISCORD_PREFIX + "channel [name / part of name]`"
                    });
                }).catch(err => {
                    core.logs.log("ERROR! Fetching channel in server " + m.guild.id + " channel " + m.member.voice.channelID + " in command song " + err, "DISCORD", core.logs.LogFile.ERROR_LOG);
                });
            }
        }

        if (args.length > 0) {
            let song = core.getServerSongs(m.guild.id)[args[0]];
            if (!song || song.length <= 0) {
                core.discord.notify(core.discord.NotifyType.Error, m.channel, {
                    description: "We could not find any song with that index!"
                });
                return;
            }

            let nueva = core.getCurrentlyPlayingSongInServer(m.guild.id).length <= 0;
            core.setCurrentlyPlayingSongInServer(m.guild.id, song, true);

            let text = "**" + song[1] + "**";
            if (core.getQueue(m.guild.id) != -1) {
                text += " | *Song queue is " + (core.getQueue(m.guild.id) ? "enabled" : "disabled") + " (" + core.discord.DISCORD_PREFIX + "queue)*";
            }
            if (core.getShuffle(m.guild.id) != -1) {
                text += " | *Song shuffle is " + (core.getShuffle(m.guild.id) ? "enabled" : "disabled") + " (" + core.discord.DISCORD_PREFIX + "shuffle)*";
            }
            core.discord.notify(core.discord.NotifyType.Info, m.channel, {
                title: "Playing in " + m.guild.name + ":",
                url: song[2],
                description: text
            });

            if (core.TECH_DIF) {
                core.discord.notify(core.discord.NotifyType.Info, m.channel, {
                    description: "Looks like I'm currently going through some technical difficulties with Youtube to fetch your songs. We are currently working on this issue."
                });
            }

            core.logs.log("Changed song playing from " + m.guild.id + " to (ID) " + song[0], "COMMON", core.logs.LogFile.COMMON_LOG);

            core.joinVoiceChannel(m.client, m.guild.id, nueva, true);
        } else {
            m.channel.send("( You can also use **" + core.discord.DISCORD_PREFIX + "song [number]** )");
            try {
                core.sendSongListAwaitReaction(m.author, m.channel, m.guild, discord, reaction => {
                    if (!reaction || !reaction.emoji) return;

                    for (let i = 0; i < core.numbers.length; i++) {
                        if (core.numbers[i] == reaction.emoji.name) {
                            let song = core.getServerSongs(m.guild.id)[i];
                            let newSong = (!core.getCurrentlyPlayingSongInServer(m.guild.id) || core.getCurrentlyPlayingSongInServer(m.guild.id).length <= 0);
                            core.setCurrentlyPlayingSongInServer(m.guild.id, song, true);
        
                            let text = "**" + song[1] + "**";
                            if (core.getQueue(m.guild.id) != -1) {
                                text += " | *Song queue is " + (core.getQueue(m.guild.id) ? "enabled" : "disabled") + " (" + core.discord.DISCORD_PREFIX + "queue)*";
                            }
                            if (core.getShuffle(m.guild.id) != -1) {
                                text += " | *Song shuffle is " + (core.getShuffle(m.guild.id) ? "enabled" : "disabled") + " (" + core.discord.DISCORD_PREFIX + "shuffle)*";
                            }
                            core.discord.notify(core.discord.NotifyType.Info, m.channel, {
                                title: "Playing in " + m.guild.name + ":",
                                url: song[2],
                                description: text
                            });
    
                            if (core.TECH_DIF) {
                                core.discord.notify(core.discord.NotifyType.Info, m.channel, {
                                    description: "Looks like I'm currently going through some technical difficulties with Youtube to fetch your songs. We are currently working on this issue."
                                });
                            }

                            core.logs.log("Changed song playing from " + m.guild.id + " to (ID) " + song[0], "COMMON", core.logs.LogFile.COMMON_LOG);
        
                            core.joinVoiceChannel(m.client, m.guild.id, newSong, true);
                            return;
                        }
                    }
    
                    core.discord.notify(core.discord.NotifyType.Error, m.channel, {
                        description: "There was an error trying to play that song!"
                    });
                });
            } catch (e) {
                core.logs.log("ERROR! At song reaction awaiter... " + e, "ERROR", core.logs.LogFile.ERROR_LOG);
            }
        }
    }
};