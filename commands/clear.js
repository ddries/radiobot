
var core = require('./../core/core.js');

module.exports = {
    name: "clear",
    description: "Removes all added songs.",
    execute: (m, args, discord) => {
        if (!core.getServerSongs(m.guild.id) || core.getServerSongs(m.guild.id).length <= 0) {
            core.discord.notify(core.discord.NotifyType.Error, m.channel, {
                description: "There aren't any songs added in " + m.guild.name + " yet! Try adding some with **" + core.getServerPrefix(m.guild.id) + "add**"
            });
            return;
        }

        m.reply("enter `y` or `yes` to confirm.");

        core.waitForUserResponse(m.author, m.channel, discord, res => {
            if (res == "y" || res == "yes") {
                let songs = core.getServerSongs(m.guild.id);

                for (let song of songs) {
                    core.removeSongFromServer(song, m.guild.id);
                }
        
                core.leaveVoiceChannel(m.guild.id);
        
                core.discord.notify(core.discord.NotifyType.Success, m.channel, {
                    description: "All songs have been removed from the server"
                });

                core.logs.log("Cleared all songs from " + m.guild.id, "COMMON", core.logs.LogFile.COMMON_LOG);
            }
        })
    }
};