
var core = require('./../core/core.js');

module.exports = {
    name: "prefix",
    description: "Shows or changes the current bot prefix.",
    execute: (m, args, discord, client) => {
        try {
            if (args.length <= 0) {
                core.discord.notify(core.discord.NotifyType.Info, m.channel, {
                    description: 'Current prefix: `' + core.getServerPrefix(m.guild.id) + '`.\n\nChange it with `' + core.getServerPrefix(m.guild.id) + 'prefix [new]`',
                    footer: 'You can also use the default prefix: ' + core.discord.DEFAULT_DISCORD_PREFIX + ' — RadioBot'
                });
                return;
            } else {
                const prefix = args[0];
                if (prefix.length > 10) {
                    core.discord.notify(core.discord.NotifyType.Error, m.channel, {
                        description: 'Maximum length of prefix is 10 characters.'
                    });
                } else {
                    core.setServerPrefix(m.guild.id, prefix);

                    core.discord.notify(core.discord.NotifyType.Success, m.channel, {
                        description: 'Changed prefix to `' + prefix + '`'
                    });

                    core.discord.sendWebhook("Changed prefix in " + m.guild.name + " (" + m.guild.id + ") to " + prefix);
                }
            }
        } catch (e) {
            core.logs.log("ERROR! Executing server command prefix: " + e, "DISCORD", core.logs.LogFile.ERROR_LOG);
        }
    }
};