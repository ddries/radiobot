
var core = require('./../core/core.js');

module.exports = {
    name: "report",
    description: "Reports a bug or a message to the Bot developers.",
    execute: (m, args, discord, client) => {
        if (args.length <= 0) {
            core.discord.notify(core.discord.NotifyType.Error, m.channel, {
                description: "USAGE: " + core.discord.DISCORD_PREFIX + "report [message]"
            });
            return;
        }

        let text = "";
        for (let i = 0; i < args.length; i++) {
            text += args[i];
            if (i+1 != args.length)
                text += " ";
        }

        if (text.length > 100) {
            core.discord.notify(core.discord.NotifyType.Error, m.channel, {
                description: "Maximum report message is 100 characters."
            });
            return;
        }

        let id = core.addReport(m.channel);

        core.discord.sendAdminWebhook("**NEW REPORT** from " + m.guild.name + " (" + m.guild.id + "), **" + m.author.tag + "**. Use " + core.discord.DISCORD_PREFIX + "replyreport " + id + " to answer:\n\n" + text);

        core.discord.notify(core.discord.NotifyType.Info, m.channel, {
            description: "Message reported. Our team will reply as soon as possible."
        });
    }
};