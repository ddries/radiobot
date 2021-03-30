
var core = require('./../core/core.js');
var fs = require('fs');

module.exports = {
    name: "shuffle",
    alias: ["sh"],
    description: "Enables/disables song shuffle.",
    show: false,
    execute: (m, args, discord, client) => {
        try {
            let shuffleStatus = core.getShuffle(m.guild.id);
            if (shuffleStatus == -1) {
                if (core.userHasPack(m.author.id, 3)) {
                    m.reply("this server does not have shuffle available, but you can redeem your pack type **3** to enable it (You have **" + core.getUserPackAmount(m.author.id, 3) + "**). Type yes/y to continue, or anything else to cancel.");
                    if (core.getQueue(m.guild.id) == -1) {
                        m.reply("**(( `WARNING` ))** You server does **NOT** have queue available. Shuffle ONLY works while queue is available in order to play randomly songs one after the other.");
                    }
                    core.waitForUserResponse(m.author, m.channel, 0, confirm => {
                        if (confirm == "yes" || confirm == "y") {
                            core.removeUserPack(m.author.id, 3);
                            core.discord.sendWebhook(m.author.username + " (" + m.author.id + ") just used a **PACK 3**");
                            
                            core.setShuffle(m.guild.id, true, true);

                            core.discord.notify(core.discord.NotifyType.Success, m.channel, {
                                description: "Enabled song shuffle. Now songs will play randomly while queue is enabled."
                            });
                
                            core.discord.sendWebhook("Shuffle enabled in **" + m.guild.name + "** (" + m.guild.id + ").");
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
                        description: "Your server does not have shuffle available. Please, check `" + core.discord.DISCORD_PREFIX + "vote` for help."
                    });
                    return;
                }
            }

            core.setShuffle(m.guild.id, !shuffleStatus, true);
            
            core.discord.notify(core.discord.NotifyType.Success, m.channel, {
                description: (shuffleStatus ? "Disabled" : "Enabled") + " song shuffle. Now songs will " + (shuffleStatus ? "not" : "") + " play randomly in queue."
            });

            core.discord.sendWebhook("Shuffle " + (shuffleStatus ? "disabled" : "enabled") + " in **" + m.guild.name + "** (" + m.guild.id + ").");
        } catch (e) {
            core.logs.log("ERROR! Executing shuffle command: " + e, "DISCORD", core.logs.LogFile.ERROR_LOG);
        }
    }
};