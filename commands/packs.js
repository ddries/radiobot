
var core = require('./../core/core.js');

module.exports = {
    name: "packs",
    description: "Shows all your unlocked packs.",
    execute: (m, args, discord, client) => {
        try {
            if (core.getUserPacks(m.author.id).length <= 0) {
                core.discord.notify(core.discord.NotifyType.Error, m.channel, {
                    description: "You don't have any packs yet! Use `" + core.getServerPrefix(m.guild.id) + "vote`"
                });
                return;
            }

            let e = new discord.MessageEmbed()
                .setURL("https://top.gg/bot/778044858760953866/vote")
                .setColor("#fc9c1e")
                .setFooter("RadioBot")
                .setTimestamp()
                .setAuthor("RadioBot", "https://theradiobot.com/img/icon.png", "https://top.gg/bot/778044858760953866/vote");
            let desc = "Packs are redeemed while you use RadioBot. If you can take profit of any pack, it will let you know. For example, if you have a  **PACK 0** and you try to add a song of 15 minutes, it will prompt you if you want to use your pack.\n\nThese are your unlocked packs, **" + m.author.username + "**:\n\n";

            let packs = {};
            for (let pack of core.getUserPacks(m.author.id)) {
                if (packs.hasOwnProperty(pack)) {
                    packs[pack]++;
                } else {
                    packs[pack] = 1;
                }
            }

            for (let p in packs) {
                desc += "➡️ You have **" + packs[p] + "** pack(s) of type **" + p + "**.\n\n";
            }

            e.setDescription(desc);

            m.channel.send({ embeds: [e]});
        } catch (e) {
            core.logs.log("ERROR! Executing packs command: " + e, "DISCORD", core.logs.LogFile.ERROR_LOG);
        }
    }
};