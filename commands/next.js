
var core = require('./../core/core.js');

module.exports = {
    name: "next",
    alias: ["n"],
    description: "Plays the next song in the song list while queue is enabled.",
    execute: (m, args) => {
        if (!core.getServerSongs(m.guild.id) || core.getServerSongs(m.guild.id).length <= 0) {
            core.discord.notify(core.discord.NotifyType.Error, m.channel, {
                description: "There aren't any songs added in " + m.guild.name + " yet! Try adding some with **" + core.discord.DISCORD_PREFIX + "add**"
            });
            return;
        }

        let current = core.getCurrentlyPlayingSongInServer(m.guild.id);
        if (!current || current.length <= 0) {
           core.discord.notify(core.discord.NotifyType.Error, m.channel, {
               description: "To use this command there has to be something playing first (" + core.discord.DISCORD_PREFIX + "song)"
           });
           return;
        }

        let songId = core.getNextSongId(m.guild.id);
        let song = core.getSongById(songId);

        core.setCurrentlyPlayingSongInServer(m.guild.id, song, true);

        let text = "**" + song[1] + "\n**";
        if (core.getQueue(m.guild.id) != -1) {
            text += '\n🔁: ' + (core.getQueue(m.guild.id) ? "✅" : "❌") + " | **(" + core.discord.DISCORD_PREFIX + "queue)**";
        }
        if (core.getShuffle(m.guild.id) != -1) {
            text += '\n🔀: ' + (core.getShuffle(m.guild.id) ? "✅" : "❌") + " | **(" + core.discord.DISCORD_PREFIX + "shuffle)**";
        }
        core.discord.notify(core.discord.NotifyType.Info, m.channel, {
            title: "Playing in " + m.guild.name + ":",
            url: song[2],
            description: text
        });

        core.logs.log("Changed song playing from " + m.guild.id + " to (ID) " + song[0], "COMMON", core.logs.LogFile.COMMON_LOG);

        core.joinVoiceChannel(m.client, m.guild.id, false, true);
    }
};