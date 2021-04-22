
var core = require('./../core/core.js');
var fs = require('fs');

module.exports = {
    name: "queue",
    alias: ["q"],
    description: "Enables/disables song queue.",
    show: false,
    execute: (m, args, discord, client) => {
        try {
            // core.discord.notify(core.discord.NotifyType.Error, m.channel, {
            //     description: "Queue is temporarily disabled."
            // });
            // return;
            let queueStatus = core.getQueue(m.guild.id);
            if (queueStatus == -1) {
                if (core.userHasPack(m.author.id, 2)) {
                    m.reply("this server does not have queue available, but you can redeem your pack type **2** to enable it (You have **" + core.getUserPackAmount(m.author.id, 2) + "**). Type yes/y to continue, or anything else to cancel.");
                    core.waitForUserResponse(m.author, m.channel, 0, confirm => {
                        if (confirm == "yes" || confirm == "y") {
                            core.removeUserPack(m.author.id, 2);
                            core.discord.sendWebhook(m.author.username + " (" + m.author.id + ") just used a **PACK 2**");
                            
                            core.setQueue(m.guild.id, true, true);

                            core.discord.notify(core.discord.NotifyType.Success, m.channel, {
                                description: "Enabled song queue. Now songs will play one after the other."
                            });
                
                            core.discord.sendWebhook("Queue enabled in **" + m.guild.name + "** (" + m.guild.id + ").");
                        } else {
                            core.discord.notify(core.discord.NotifyType.Error, m.channel, {
                                description: "Operation was cancelled"
                            });
                            return;
                        }
                    });
                    return;
                } else {
                    core.discord.notify(core.discord.NotifyType.Error, m.channel, {
                        description: "Your server does not have queue available. Please, check `" + core.getServerPrefix(m.guild.id) + "vote` for help."
                    });
                    return;
                }
            }

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