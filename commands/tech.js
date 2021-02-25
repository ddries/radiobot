
var core = require('./../core/core.js');

module.exports = {
    name: "tech",
    show: false,
    description: "Changes techinal difficulties option. (ADMIN USE)",
    execute: (m, args) => {
        try {
            if (m.author.id == core.config.admin_id) {
                core.TECH_DIF = args[0];
                m.react('✅');
            }
        } catch (e) {
            core.logs.log("ERROR! Executing tech command: " + e, "DISCORD", core.logs.LogFile.ERROR_LOG);
        }
    }
};