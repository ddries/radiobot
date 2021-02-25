
var core = require('./../core/core.js');

module.exports = {
    name: "headers",
    description: "Shows the headers that are being sent to Youtube (ADMIN USE).",
    show: false,
    execute: (m, args, discord, client) => {
        try {
            if (m.author.id == core.config.admin_id) {
                m.reply(JSON.stringify(core.YOUTUBE_DEFAULT_HEADERS));
                m.react('✅');
            }
        } catch (e) {
            core.logs.log("ERROR! Executing server command headers: " + e, "DISCORD", core.logs.LogFile.ERROR_LOG);
        }
    }
};