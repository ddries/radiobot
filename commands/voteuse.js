
var core = require('./../core/core.js');
const vote = require('./vote.js');

module.exports = {
    name: "voteuse",
    description: "Spend your RadioBot votes for benefits.",
    execute: (m, args, discord, client) => {
        try {
            if (core.isServerOnCooldown(m.guild.id)) {
                core.discord.notify(core.discord.NotifyType.Error, m.channel, {
                    description: "Please wait a bit to run this command"
                });
                return;
            }

            if (args.length < 1 || isNaN(args[0])) {
                core.discord.notify(core.discord.NotifyType.Error, m.channel, {
                    description: "USAGE: " + core.discord.DISCORD_PREFIX + "voteuse [pack]"
                });
                return;
            }

            let userVotes = core.getUserVotes(m.author.id);
            let votesNeeded = 0;
            let pack = parseInt(args[0]);

            switch (pack) {
                case 0:
                    votesNeeded = 2;
                    break;
                case 1:
                    votesNeeded = 5;
                    break;
                case 2:
                    votesNeeded = 2;
                    break;
            }

            if (votesNeeded <= 0) {
                core.discord.notify(core.discord.NotifyType.Error, m.channel, {
                    description: "**Pack " + pack + "** not found. Please, check all packs with `" + core.discord.DISCORD_PREFIX + "vote`"
                });
                return;
            }

            if (userVotes < votesNeeded) {
                core.discord.notify(core.discord.NotifyType.Error, m.channel, {
                    description: "You don't have enough votes! For pack " + pack + " you need at least " + votesNeeded + " votes (You have " + userVotes + ")"
                });
                return;
            }

            core.setUserVotes(m.author.id, (parseInt(userVotes) - votesNeeded));
            core.mysql.query("UPDATE votes SET votes = " + (parseInt(userVotes) - votesNeeded) + " WHERE userid=" + m.author.id);
            core.addUserPack(m.author.id, pack, true);

            core.discord.notify(core.discord.NotifyType.Success, m.channel, {
                description: "**Congratulations!** You bought one **PACK " + pack + "** for **" + votesNeeded + " votes**. You may see what you got with `" + core.discord.DISCORD_PREFIX + "vote`."
            });
            core.discord.sendWebhook(m.author.username + " (" + m.author.id + ") just purchashed a **PACK " + pack + "**");
        } catch (e) {
            core.logs.log("ERROR! Executing vote command: " + e, "DISCORD", core.logs.LogFile.ERROR_LOG);
        }
    }
};