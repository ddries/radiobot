
var core = require('./../core/core.js');

module.exports = {
    name: "cancel",
    description: "Cancels any task you have pending with the Bot.",
    execute: (m, args) => {
        if (core.getUserWaitingForResponse(m.guild.id).length <= 0
            || core.getUserWaitingForResponse(m.guild.id)[0] != m.author.id) {

            core.discord.notify(core.discord.NotifyType.Error, m.channel, {
                description: "You don't have any pending tasks."
            });
            return;
        }
        
        core.clearUserWaitingForResponse(m.guild.id);

        core.discord.notify(core.discord.NotifyType.Error, m.channel, {
            description: "Canceled any pending tasks."
        });
    }
};