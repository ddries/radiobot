
var core = require('./../core/core.js');
var fs = require('fs');

module.exports = {
    name: "log",
    description: "Sends a log file (ADMIN USE).",
    show: false,
    execute: (m, args, discord, client) => {
        try {
            if (m.author.id == core.config.admin_id) {
                return;
                let sent = false;
                for (let lf in core.logs.LogFile) {
                    if (core.logs.LogFile[lf].includes(args[0])) {
                        m.channel.send({
                            files: [
                                core.logs.LogFile[lf]
                            ]
                        });
                        sent = true;
                        m.react('✅');
                        return;
                    }
                }
    
                setTimeout(() => {
                    if (!sent) {
                        core.discord.notify(core.discord.NotifyType.Error, m.channel, {
                            description: "Could not find log " + args[0]
                        });     
                    }
                }, 1000);
            }
        } catch (e) {
            core.logs.log("ERROR! Executing log command: " + e, "DISCORD", core.logs.LogFile.ERROR_LOG);
        }
    }
};