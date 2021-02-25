
var core = require('./../core/core.js');

module.exports = {
    name: "invite",
    description: "Shows the invite link for the bot.",
    execute: (m, args, discord, client) => {
        try {
            m.reply("here's the link for RadioBot: https://theradiobot.com/join");
        } catch (e) {
            core.logs.log("ERROR! Executing server command invite: " + e, "DISCORD", core.logs.LogFile.ERROR_LOG);
        }
    }
};