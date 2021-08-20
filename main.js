const Discord = require('discord.js');
const client = new Discord.Client({
    intents: [
        Discord.Intents.FLAGS.GUILDS,
        Discord.Intents.FLAGS.GUILD_MESSAGES,
        Discord.Intents.FLAGS.GUILD_VOICE_STATES,
        Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS
    ]
});

const DBL = require("dblapi.js");

var core = require('./core/core.js');
var web = require('./webserver.js');

const dbl = new DBL(core.config.dbl_token, client);

const DEBUG = false;

core.init(() => {
    core.logs.log("Initialized core modules", "LOAD", core.logs.LogFile.LOAD_LOG);

    let mysqlLoaded = false;
    core.mysql.connect(() => {
        core.logs.log("Connected to MYSQL database", "MYSQL", core.logs.LogFile.MYSQL_LOG);

        // Load songs, currently playing songs and channels of all servers
        core.mysql.queryGetResult("SELECT * FROM song", res => {
            for (let song of res) {
                if (DEBUG && song.serverid != 447520366290796544) continue;
                core.addSongToServer([song.id, song.name, song.url], song.serverid);
                core.addSongById(song.id, [song.id, song.name, song.url]);
                core.setVideoId(song.id, song.video_id, false);

                core.totalSongs++;

                core.logs.log("Added song " + JSON.stringify([song.id, song.name, song.url]) + " to server " + song.serverid, "LOAD", core.logs.LogFile.LOAD_LOG);
            }

            core.mysql.queryGetResult("SELECT * FROM song_lives", resLives => {
                for (let song of resLives) {
                    if (DEBUG && song.serverid != 447520366290796544) continue;
                    core.addSongToServer([song.id, song.name, song.url, true], song.serverid); // live video -> true
                    core.addSongById(song.id, [song.id, song.name, song.url]);
                    core.setVideoId(song.id, song.video_id, false);

                    core.totalSongs++;

                    core.logs.log("Added LIVE song " + JSON.stringify([song.id, song.name, song.url, true]) + " to server " + song.serverid, "LOAD", core.logs.LogFile.LOAD_LOG);
                }
            });

            core.mysql.queryGetResult("SELECT * FROM votes", resVotes => {
                for (let userVote of resVotes) {
                    core.setUserVotes(userVote.userid, userVote.votes);
                    core.logs.log("Set votes of user " + userVote.userid + " to " + userVote.votes, "LOAD", core.logs.LogFile.LOAD_LOG);
                }
            });

            core.mysql.queryGetResult("SELECT * FROM vote_packs", resPacks => {
                for (let userPack of resPacks) {
                    core.addUserPack(userPack.userid, userPack.pack, false);
                    core.logs.log("Added new vote pack for user " + userPack.userid + ": " + userPack.pack, "LOAD", core.logs.LogFile.LOAD_LOG);
                }
            });

            core.mysql.queryGetResult("SELECT * FROM server_maxsongs", resMax => {
                for (let serverMax of resMax) {
                    core.setServerMaxSongs(serverMax.serverid, serverMax.max_songs, false);
                    core.logs.log("Set server max songs of " + serverMax.serverid + " to " + serverMax.max_songs, "LOAD", core.logs.LogFile.LOAD_LOG);
                }
            });

            core.mysql.queryGetResult("SELECT * FROM prefixes", resPrefixes => {
                for (let serverPrefix of resPrefixes) {
                    core.setServerPrefix(serverPrefix.serverid, serverPrefix.prefix, false);
                    core.logs.log("Set server prefix of " + serverPrefix.serverid + " to " + serverPrefix.prefix, "LOAD", core.logs.LogFile.LOAD_LOG);
                }
            });

            for (let server of core.getAllServers()) {
                core.mysql.queryGetResult("SELECT song_id FROM current_playing WHERE serverid=" + server, _res => {
                    if (_res.length > 0) {
                        let songId = _res[0].song_id;
                        core.setCurrentlyPlayingSongInServer(server, core.getSongById(songId));
                        core.logs.log("Set currently playing song " + JSON.stringify(core.getSongById(songId)) + " to server " + server, "COMMON", core.logs.LogFile.COMMON_LOG);
                    }
                });

                core.mysql.queryGetResult("SELECT channelid FROM channel WHERE serverid="+server, res => {
                    if (res.length > 0) {
                        core.setServerChannel(server, res[0].channelid);
                        core.logs.log("Set fixed channel to " + core.getServerChannel(server) + " of server " + server, "COMMON", core.logs.LogFile.COMMON_LOG);
                    }
                });

                core.mysql.queryGetResult("SELECT state FROM queue WHERE serverid=" + server, res => {
                    if (res.length > 0) {
                        if (res[0].state) {
                            core.setQueue(server, true, false);
                            core.logs.log("Enabled song queue to " + server, "COMMON", core.logs.LogFile.COMMON_LOG);
                        } else {
                            core.setQueue(server, false, false);    
                        }
                    } /* else {
                        core.setQueue(server, false, false);
                    } */
                });

                core.mysql.queryGetResult("SELECT state FROM shuffle WHERE serverid=" + server, res => {
                    if (res.length > 0) {
                        if (res[0].state) {
                            core.setShuffle(server, true, false);
                            core.logs.log("--------------> Enabled song shuffle to " + server, "COMMON", core.logs.LogFile.COMMON_LOG);
                        } else {
                            core.setShuffle(server, false, false);
                        }
                    } /* else {
                        core.setQueue(server, false, false);
                    } */
                });
            }

            setTimeout(() => {
                core.logs.log("Loaded (" + core.getAllServers().length + ") server(s).", "LOAD", core.logs.LogFile.LOAD_LOG);
                mysqlLoaded = true;
            }, DEBUG ? 5*1000 : 20*1000);
        });
    });

    core.discord.messageParser(client, Discord);

    // client.on('debug', console.log).on('warn', console.log);

    client.once("ready", () => {
        core.logs.log("Logged in " + client.user.tag, "DISCORD", core.logs.LogFile.DISCORD_LOG);
        core.discord.setActivity(client, core.discord.DEFAULT_DISCORD_PREFIX + "help");

        core.setClientId(client.user.id);

        web.init();

        if (!DEBUG) {
            core.discord.noticeOnline();
        }
        setInterval(() => {
            core.discord.setActivity(client, core.discord.DEFAULT_DISCORD_PREFIX + "help | " + core.getServerCount(client) + " servers | " + core.totalSongs + " songs");
        }, 7200);
        if (!DEBUG) {
            setTimeout(() => {
                core.logs.log("Cleaning removed servers", "COMMON", core.logs.LogFile.COMMON_LOG);
                
                // let a = 0;
                // let b = core.getAllServers();
                // let _i = setInterval(() => {
                //     try {
                //         let _s = b[a];
                //         client.guilds.fetch(_s).then().catch(err => {
                //             core.removeServer(_s);
                //         });
                //     } catch (e) {
                //         core.removeServer(_s);
                //     }
                //     a++;
                //     if (a > b.length) {
                //         clearInterval(_i);
                //         _i = null;
                //     }
                // }, 500);
                ///////////////////////////////////////////////////
                // for (let _s of core.getAllServers()) {
                //     try {
                //         client.guilds.fetch(_s).then().catch(err => {
                //             core.removeServer(_s);
                //         });
                //     } catch (e) {
                //         core.removeServer(_s);
                //     }
                // }
            }, 30*1000);
        }

        if (!DEBUG) {
            dbl.postStats(core.getServerCount(client));
            setInterval(() => {
                dbl.postStats(core.getServerCount(client));
            }, 1800 * 1000);

            core.logs.log('Trying to get through API', "HEARTBEAT", core.logs.LogFile.DOWNLOAD_LOG);
            core.request(core.API_WRAPPER_URL, (err, resp, body) => {
                if (resp.statusCode !== 200) {
                    core.discord.sendAdminWebhook("COULD NOT VERIFY API WORKING STATUS!! PLEASE CHECK [RADIOBOT YOUTUBE API WRAPPER](" + core.API_WRAPPER_URL + ").");
                }
            });
            setInterval(() => {
                core.logs.log('Trying to get through API', "HEARTBEAT", core.logs.LogFile.DOWNLOAD_LOG);
                core.request(core.API_WRAPPER_URL, (err, resp, body) => {
                    if (resp.statusCode !== 200) {
                        core.discord.sendAdminWebhook("COULD NOT VERIFY API WORKING STATUS!! PLEASE CHECK [RADIOBOT YOUTUBE API WRAPPER](" + core.API_WRAPPER_URL + ").");
                    }
                });
            }, 1800 * 1000);
        }

        let i = 0;
        let servers = core.getAllServers();
        const _loop_servers_init = () => {
            setTimeout(async () => {
                i++;
                if (i < servers.length) {
                    try {
                        const _s = await client.guilds.fetch(servers[i]).catch((__e) => {});
                        if (_s) {
                            core.joinVoiceChannel(client, _s);
                            _loop_servers_init();
                        }
                    } catch(_e) {}
                }
            }, 100);
        };
        _loop_servers_init();
        // for (let server of core.getAllServers()) {
        //     if (core.getServerSongs(server).length > 0 && core.getCurrentlyPlayingSongInServer(server).length > 0) {
        //         setTimeout(() => {
        //             client.guilds.fetch(server).then(g => {
        //                 core.joinVoiceChannel(client, g);
        //                 // g.members.fetch(client.user.id).then(u => {
        //                 //     try {
        //                 //         if (u.voice.channelId) {
        //                 //             u.voice.setDeaf(true).then().catch(err => {
        //                 //                 core.logs.log("ERROR! Deaf RadioBot (" + server + ") at ready event " + err, "DISCORD", core.logs.LogFile.ERROR_LOG);
        //                 //             });
        //                 //         } else {
        //                 //             let n = 0;
        //                 //             let _i = setInterval(() => {
        //                 //                 if (++n > 15) {
        //                 //                     clearInterval(_i);
        //                 //                     _i = null;
        //                 //                 } else {
        //                 //                     if (u.voice.channelId) {
        //                 //                         u.voice.setDeaf(true).then().catch(err => {
        //                 //                             core.logs.log("ERROR! Deaf RadioBot (" + server + ") at ready event " + err, "DISCORD", core.logs.LogFile.ERROR_LOG);
        //                 //                         });
        //                 //                         clearInterval(_i);
        //                 //                         _i = null;
        //                 //                     }
        //                 //                 }
        //                 //             }, 100);
        //                 //         }
        //                 //     } catch (e) {
        //                 //         core.logs.log("ERROR! At Bot initialization (" + server + "): " + e, "ERROR", core.logs.LogFile.ERROR_LOG);
        //                 //     }
        //                 // }).catch(err => {
        //                 //     core.logs.log("ERROR! Fetching member (" + server + ") " + client.user.id + " at ready event " + err, "DISCORD", core.logs.LogFile.ERROR_LOG);
        //                 // });
        //             }).catch(err => {
        //                 core.logs.log("ERROR! Fetching guild " + server + " at ready event " + err, "DISCORD", core.logs.LogFile.ERROR_LOG);
        //             });
        //         }, 500);
        //     }
        // }
    });

    client.on("guildCreate", guild => {
        // let ownerId = guild.ownerId;

        // client.users.fetch(ownerId).then(owner => {
        //     let e = new Discord.MessageEmbed()
        //         .setColor(core.discord.NotifyType.Info)
        //         .setFooter("RadioBot");

        //     e.setTimestamp();
        //     e.setDescription("Thanks for adding me to your server!\n\n" + 
        //                     "Before you can actually play songs non-stop, you'll need to configure me first.\n\n" + 
        //                     "First of all, choose a voice channel for me. You can do this with `" + core.getServerPrefix(m.guild.id) + "channel [name / part of name]`.\n\n" +
        //                     "You will also need to add songs to the server. You can do this with `" + core.getServerPrefix(m.guild.id) + "add`.\n\n"+
        //                     "If you need more help, you can type `" + core.getServerPrefix(m.guild.id) + "help`.\n\n" +
        //                     "I really hope you enjoy me!\n\n");
        //     owner.send(e).then().catch(err => {
        //         core.logs.log("ERROR! Sending DM to user " + ownerId + " at guildCreate event " + err, "DISCORD", core.logs.LogFile.ERROR_LOG);
        //     });
        // }).catch(err => {
        //     core.logs.log("ERROR! Fetching member " + ownerId + " at guildCreate event " + err, "DISCORD", core.logs.LogFile.ERROR_LOG);
        // });

        core.logs.log("Joined " + guild.name + " (" + guild.id + ")", "JOIN", core.logs.log.COMMON_LOG);
        core.discord.sendWebhook("Joined " + guild.name + " (" + guild.id + ")");
    });

    client.on("voiceStateUpdate", async (oldState, newState) => {
        // return;
        if (newState.member.id == client.user.id) {
            if (core.isServerDisconnected(newState.member.guild.id)) return;
            
            try {
                let voiceChannel = core.getServerChannel(newState.member.guild.id);
                if (newState.member.voice.channelId != voiceChannel) {
                    if (!newState.channelId) {
                        core.joinVoiceChannel(client, oldState.member.guild); // newState
                        return;
                    }
                    // } else {
                    //     if ((newState.connection && oldState.connection) && newState.member.voice.channelId && (newState.member.voice.channelId != core.getServerChannel(newState.member.guild.id))) {
                    //         if (voiceChannel.length > 0) {
                    //             if (voiceChannel == oldState.channelId) {
                    //                 if (newState.connection.status != 0) {
                    //                     let a = 0;
                    //                     let _i = setInterval(() => {
                    //                         a++;
                    //                         if (newState.connection && newState.connection.status == 0) {
                    //                             if (newState.connection.status == 0) {
                    //                                 setTimeout(() => {
                    //                                     newState.setChannel(oldState.channelId);
                    //                                 }, 200);   
                    //                             }
                    //                             clearInterval(_i);
                    //                             _i = null;
                    //                             return;
                    //                         }
                    //                         if (a > 15) {
                    //                             clearInterval(_i);
                    //                             _i = null;
                    //                         }
                    //                     }, 10);
                    //                 } else {
                    //                     if (newState.connection.status == 0) {
                    //                         setTimeout(() => {
                    //                             newState.setChannel(oldState.channelId);
                    //                         }, 200);
                    //                     }
                    //                 }
                    //                 return;
                    //             }
                    //         }
                    //     }
                    // }
                }
        
                // if (newState.member.voice && newState.member.voice.channelId == voiceChannel) {
                //     if (!newState.serverDeaf && (oldState.serverDeaf || !oldState.member.voice)) {
                //         newState.setDeaf(true);
                //         let e = new Discord.MessageEmbed()
                //             .setColor(core.discord.NotifyType.Info)
                //             .setFooter("RadioBot")
                //             .setTimestamp()
                //             .setDescription("Hey! Looks like I was undeafened in **" + newState.member.guild.name + "**. Take into consideration the fact that I'm deafened to reduce bandwidth usage and increase your privacy.");
            
                //         let channel_id = core.getServerLastUsedChannel(newState.member.guild.id);
                //         if (channel_id.length > 0) {
                //             client.channels.fetch(channel_id).then(c => {
                //                 c.send({ embeds: [e] });
                //             }).catch(err => {
                //                 core.logs.log("ERROR! Sending message to server " + newState.member.guild.id + " to channel " + channel_id + " at voiceStatusUpdate event " + err, "DISCORD", core.logs.LogFile.ERROR_LOG);
                //             });
                //         } else {
                //             core.logs.log("Could not send bot deafen warning due to server last used channel being null on " + newState.member.guild.id, "DISCORD", core.logs.LogFile.ERROR_LOG);
                //         }
                //     }
                // }
            } catch (e) {
                core.logs.log("ERROR! At voiceStatusUpdate... " + e, "DISCORD", core.logs.LogFile.ERROR_LOG);
            }
        } else {
            if (newState.channelId != oldState.channelId) {
                if (newState.member.voice) {
                    if (newState.channelId == core.getServerChannel(newState.guild.id)) {
                        if (core.getCollectionSize(newState.channel.members) == 2 && !core.isServerDisconnected(newState.guild.id)
                                && !core.isCurrentlyPlayingSongPaused(newState.guild.id)) {
                            core.startLoopPlay(newState.channel, false, false);
                        }
                    }
                }
    
                if (oldState.member.voice && oldState.channel && core.getCollectionSize(oldState.channel.members) == 1 && oldState.channel.members.first().id == client.user.id) {
                    core.stopPlayingCurrentSong(oldState.guild.id);
                }
            }
        }
    });

    // client.on("error", console.log);

    client.on("error", error => {
        core.logs.log("ERROR! On Error event: " + error, "DISCORD/EVENT", core.logs.LogFile.ERROR_LOG);
        core.discord.sendAdminWebhook("ERROR! On Error event: " + error);
    });

    let _i = setInterval(() => {
        if (mysqlLoaded) {
            core.logs.log("Loaded all MySQL data", "MYSQL", core.logs.LogFile.MYSQL_LOG);

            client.login(core.discord.DISCORD_TOKEN).then(() => {
                core.logs.log("Logged in successfully to Discord", "DISCORD", core.logs.LogFile.LOAD_LOG);
            }).catch(err => {
                core.logs.log("ERROR! Could not login to Discord: " + err, "LOAD", core.logs.LogFile.ERROR_LOG);
            });
            clearInterval(_i);
            _i = null;
        }
    }, 100);
});