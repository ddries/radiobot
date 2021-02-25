
var core = require('./../core/core.js');

module.exports = {
    name: "info",
    description: "Shows information about the specified song.",
    execute: (m, args, discord) => {
        if (!core.getServerSongs(m.guild.id) || core.getServerSongs(m.guild.id).length <= 0) {
            core.discord.notify(core.discord.NotifyType.Error, m.channel, {
                description: "There aren't any songs added in " + m.guild.name + " yet! Try adding some with **" + core.discord.DISCORD_PREFIX + "add**"
            });
            return;
        }
        
        if (args.length > 0) {
            let i = args[0];
            let song = core.getServerSongs(m.guild.id)[i];

            core.discord.notify(core.discord.NotifyType.Info, m.channel, {
                title: song[1],
                url: song[2],
            });
            return;
        } else {
            m.channel.send("( You can also use **" + core.discord.DISCORD_PREFIX + "info [number]** )");
            core.sendSongListAwaitReaction(m.author, m.channel, m.guild, discord, reaction => {
                for (let i = 0; i < core.numbers.length; i++) {
                    if (core.numbers[i] == reaction.emoji.name) {
                        let song = core.getServerSongs(m.guild.id)[i];

                        core.discord.notify(core.discord.NotifyType.Info, m.channel, {
                            title: song[1],
                            url: song[2],
                        });
                        return;
                    }
                }

                core.discord.notify(core.discord.NotifyType.Error, m.channel, {
                    description: "There was an error trying to show that song!"
                });
            });
        }
    }
};