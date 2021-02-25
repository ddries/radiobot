
var core = require('./../core/core.js');

module.exports = {
    name: "resume",
    alias: ["r"],
    description: "Resumes the current playing song.",
    execute: (m, args) => {
        let song = core.getCurrentlyPlayingSongInServer(m.guild.id);

        if (!song || song.length <= 0) {
            core.discord.notify(core.discord.NotifyType.Error, m.channel, {
                description: "There's nothing playing in " + m.guild.name + "!"
            });
            return;
        }

        core.resumeCurrentlyPlayingSong(m.guild.id);

        core.discord.notify(core.discord.NotifyType.Info, m.channel, {
            description: "Resumed song in **" + m.guild.name + "**"
        });
    }
};