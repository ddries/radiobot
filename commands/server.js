
var core = require('./../core/core.js');

module.exports = {
    name: "server",
    description: "Gets the number of servers the bot is in (ADMIN USE).",
    show: false,
    execute: (m, args, discord, client) => {
        try {
            if (m.author.id == core.config.admin_id) {
                m.reply("the bot is in approximately " + core.getServerCount(client) + " servers (" + core.getAllServers().length + ").");
                m.react('✅');
            }
        } catch (e) {
            core.logs.log("ERROR! Executing server command: " + e, "DISCORD", core.logs.LogFile.ERROR_LOG);
        }
    }
};