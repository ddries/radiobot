
var core = require('./../core/core.js');
var fs = require('fs');

module.exports = {
    name: "queue",
    alias: ["q"],
    description: "Enables/disables song queue.",
    show: false,
    execute: (m, args, discord, client) => {
        try {
            core.discord.notify(core.discord.NotifyType.Error, m.channel, {
                description: "Queue is temporarily disabled."
            });
            return;
            let queueStatus = core.getQueue(m.guild.id);
            core.setQueue(m.guild.id, !queueStatus, true);
            
            core.discord.notify(core.discord.NotifyType.Success, m.channel, {
                description: (queueStatus ? "Disabled" : "Enabled") + " song queue. Now songs will " + (queueStatus ? "not" : "") + " play one after the other."
            });

            core.discord.sendWebhook("Queue " + (queueStatus ? "disabled" : "enabled") + " in **" + m.guild.name + "** (" + m.guild.id + ").");
        } catch (e) {
            core.logs.log("ERROR! Executing queue command: " + e, "DISCORD", core.logs.LogFile.ERROR_LOG);
        }
    }
};