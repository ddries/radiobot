
var core = require('./../core/core.js');

module.exports = {
    name: "replyreport",
    show: false,
    alias: ["rr"],
    description: "Replies a report sent by users (ADMIN USE).",
    execute: (m, args, discord, client) => {
        if (args.length <= 0) {
            core.discord.notify(core.discord.NotifyType.Error, m.channel, {
                description: "USAGE: " + core.discord.DISCORD_PREFIX + "replyreport [id] [message]"
            });
            return;
        }

        let id = args[0];

        if (isNaN(id)) {
            core.discord.notify(core.discord.NotifyType.Error, m.channel, {
                description: "USAGE: " + core.discord.DISCORD_PREFIX + "replyreport [id] [message]"
            });
            return;
        }

        let text = "";
        for (let i = 1; i < args.length; i++) {
            text += args[i];
            if (i+1 != args.length)
                text += " ";
        }

        if (!core.replyReport(id, discord, text)) {
            core.discord.notify(core.discord.NotifyType.Error, m.channel, {
                description: "Report does not exist."
            });
            return;
        }

        core.discord.notify(core.discord.NotifyType.Info, m.channel, {
            description: "Report attended."
        });
    }
};