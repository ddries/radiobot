
var core = require('../core/core.js');

module.exports = {
    name: "channel",
    alias: ["c"],
    description: "Shows or changes the channel where the bot is fixed.",
    execute: (m, args, discord, client) => {
        if (args.length <= 0) {
            let channel = core.getServerChannel(m.guild.id);
            if (!channel || channel.length <= 0) {
                core.discord.notify(core.discord.NotifyType.Error, m.channel, {
                    description: "I'm not configured in this server yet! `" + core.getServerPrefix(m.guild.id) + "channel [name / part of name]`"
                });

                return;
            }

            client.channels.fetch(channel).then(c => {
                core.discord.notify(core.discord.NotifyType.Info, m.channel, {
                    description: "Currently fixed in: **" + c.name + "**\n\n" +
                                "Type `" + core.getServerPrefix(m.guild.id) + "channel [name / part of name]` to change this channel"
                });
            }).catch(err => {
                core.logs.log("ERROR! Fetching channel in server " + m.guild.id + " channel " + channel + " in command channel " + err, "DISCORD", core.logs.LogFile.ERROR_LOG);
            });
        } else {
            let name = "";
            for (let i = 0; i < args.length; i++) {
                name += args[i];
                if (i+1 != args.length)
                    name += " ";
            }

            client.guilds.fetch(m.guild.id).then(g => {
                for (let c of g.channels.cache) {
                    if (c[1].type == 'GUILD_VOICE' && (c[1].name.toLowerCase() === name.toLowerCase() || c[1].name.toLowerCase().includes(name.toLowerCase()))) {
                        let id = c[1].id;

                        if (!c[1].permissionsFor(client.user.id).has('CONNECT', false)) {
                            core.discord.notify(core.discord.NotifyType.Error, m.channel, {
                                description: "Could not join **" + c[1].name + "** because I don't have enough permissions"
                            });
                            return;
                        }

                        core.setServerChannel(m.guild.id, id, true);

                        if (core.getCurrentlyPlayingSongInServer(m.guild.id).length > 0)
                            core.joinVoiceChannel(client, m.guild.id);
                        else {
                            core.discord.notify(core.discord.NotifyType.Info, m.channel, {
                                description: "There's nothing playing in this server. Don't forget to use **" + core.getServerPrefix(m.guild.id) + "song** after disconnecting the bot with **" + core.getServerPrefix(m.guild.id) + "dc**"
                            })
                        }

                        core.discord.notify(core.discord.NotifyType.Success, m.channel, {
                            description: "Changed fixed channel to **" + c[1].name + "**"
                        });

                        core.logs.log("Changed fixed channel from " + m.guild.id + " to " + c[0], "COMMON", core.logs.LogFile.COMMON_LOG);
                        return;
                    }
                }

                core.discord.notify(core.discord.NotifyType.Error, m.channel, {
                    description: "Could not find any voice channel with that name!"
                });
            }).catch(err => {
                core.logs.log("ERROR! Fetching guild " + serverid + " in command channel " + err, "DISCORD", core.logs.LogFile.ERROR_LOG);
            });
        }
    }
};