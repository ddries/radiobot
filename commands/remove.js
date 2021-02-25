
var core = require('./../core/core.js');

module.exports = {
    name: "remove",
    description: "Removes the specified song from your server.",
    execute: (m, args, discord) => {
        if (!core.getServerSongs(m.guild.id) || core.getServerSongs(m.guild.id).length <= 0) {
            core.discord.notify(core.discord.NotifyType.Error, m.channel, {
                description: "There aren't any songs added in " + m.guild.name + " yet! Try adding some with **" + core.discord.DISCORD_PREFIX + "add**"
            });
            return;
        }

        if (args.length > 0) {
            let songs = core.getServerSongs(m.guild.id);
            let ni = -1;
            let i = args[0];
            let song = songs[i];

            if (isNaN(i)) {
                core.discord.notify(core.discord.NotifyType.Error, m.channel, {
                    description: "The specified value is not correct (must be a number)"
                });

                return;
            }

            if (song[0] == core.getCurrentlyPlayingSongInServer(m.guild.id)[0]) {
                if (i > 0) ni = i-1;
                else ni = i+1;
            }

            let name = song[1];
            let url = song[2];
            let id = song[0];

            core.removeSongFromServer(song, m.guild.id);

            core.discord.notify(core.discord.NotifyType.Success, m.channel, {
                title: name,
                url: url,
                description: "The song **" + name + "** has been removed from **" + m.guild.name + "**"
            });

            core.logs.log("Removed song (ID) " + id + " from " + m.guild.id, "COMMON", core.logs.LogFile.COMMON_LOG);

            if (ni >= 0 && core.getServerSongs(m.guild.id).length > 0) {
                core.setCurrentlyPlayingSongInServer(m.guild.id, songs[ni], true);
                core.joinVoiceChannel(m.client, m.guild.id, false);
            }
            return;
        } else {
            m.channel.send("( You can also use **" + core.discord.DISCORD_PREFIX + "remove [number]** )");
            core.sendSongListAwaitReaction(m.author, m.channel, m.guild, discord, reaction => {
                for (let i = 0; i < core.numbers.length; i++) {
                    if (core.numbers[i] == reaction.emoji.name) {
                        let songs = core.getServerSongs(m.guild.id);
                        let ni = -1;

                        if (songs[i][0] == core.getCurrentlyPlayingSongInServer(m.guild.id)[0]) {
                            if (i > 0) ni = i-1;
                            else ni = i+1;
                        }

                        let name = songs[i][1];
                        let url = songs[i][2];
                        let id = songs[i][0];

                        core.removeSongFromServer(songs[i], m.guild.id);

                        core.discord.notify(core.discord.NotifyType.Success, m.channel, {
                            title: name,
                            url: url,
                            description: "The song **" + name + "** has been removed from **" + m.guild.name + "**"
                        });
    
                        core.logs.log("Removed song (ID) " + id + " from " + m.guild.id, "COMMON", core.logs.LogFile.COMMON_LOG);

                        if (ni >= 0 && core.getServerSongs(m.guild.id).length > 0) {
                            core.setCurrentlyPlayingSongInServer(m.guild.id, songs[ni], true);
                            core.joinVoiceChannel(m.client, m.guild.id, false);
                        }
                        return;
                    }
                }

                core.discord.notify(core.discord.NotifyType.Error, m.channel, {
                    description: "There was an error trying to play that song!"
                });
            });
        }
    }
};