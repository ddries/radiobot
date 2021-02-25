
var core = require('./../core/core.js');

module.exports = {
    name: "pause",
    alias: ["p"],
    description: "Pauses the current playing song.",
    execute: (m, args) => {
        let song = core.getCurrentlyPlayingSongInServer(m.guild.id);

        if (!song || song.length <= 0) {
            core.discord.notify(core.discord.NotifyType.Error, m.channel, {
                description: "There's nothing playing in " + m.guild.name + "!"
            });
            return;
        }

        core.pauseCurrentlyPlayingSong(m.guild.id);

        core.discord.notify(core.discord.NotifyType.Info, m.channel, {
            description: "Paused song in **" + m.guild.name + "**"
        });
    }
};