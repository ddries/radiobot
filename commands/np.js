
var core = require('./../core/core.js');

module.exports = {
    name: "np",
    description: "Show the currently playing song in your server.",
    execute: (m, args) => {
        let song = core.getCurrentlyPlayingSongInServer(m.guild.id);

        if (!song || song.length <= 0) {
            core.discord.notify(core.discord.NotifyType.Error, m.channel, {
                description: "There's nothing playing in " + m.guild.name + "!"
            });
            return;
        }
        
        if (core.TECH_DIF) {
            core.discord.notify(core.discord.NotifyType.Info, m.channel, {
                description: "Looks like I'm currently going through some technical difficulties with Youtube to fetch your songs. We are currently working on this issue."
            });
        }

        let text = song[1];
        if (core.getQueue(m.guild.id) != -1) {
            text += " | *Song queue is " + (core.getQueue(m.guild.id) ? "enabled" : "disabled") + " (" + core.discord.DISCORD_PREFIX + "queue)*";
        }
        core.discord.notify(core.discord.NotifyType.Info, m.channel, {
            title: "Playing in " + m.guild.name + ":",
            url: song[2],
            description: text
        });
    }
};