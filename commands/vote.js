
var core = require('./../core/core.js');

module.exports = {
    name: "vote",
    description: "Shows the link to vote for RadioBot and get benefits.",
    execute: (m, args, discord, client) => {
        try {
            let e = new discord.MessageEmbed()
            .setURL("https://top.gg/bot/778044858760953866/vote")
                .setColor("#fc9c1e")
                .setFooter("RadioBot")
                .setTimestamp()
                .setAuthor("RadioBot", "https://theradiobot.com/img/icon.png", "https://top.gg/bot/778044858760953866/vote")
                .setDescription("**[Vote here](https://top.gg/bot/778044858760953866/vote)** for **RadioBot** and get benefits! You can vote for free for RadioBot on Top.gg. When you reach 2 or more votes, you can spend your collected votes for special benefits for your server!\n\n"
                + "You can get these benefits using `" + core.getServerPrefix(m.guild.id) + "voteuse [pack]`, being `[pack]` the feature you want to unlock, for example: `" + core.getServerPrefix(m.guild.id) + "voteuse 0`, to unlock a slot for a longer song.\n\n" +
                "Packs are redeemed while you use RadioBot. That means that you will be able to redeem the **PACK 0** when you try to add a song longer than 10 minutes and shorter than 20 minutes, and you own a **PACK 0**." + 
                "\n\n**" + m.author.username + "**, you have **" + core.getUserVotes(m.author.id) + "** vote(s). You have **" + core.getUserPacks(m.author.id).length + "** pack(s), you may check them with `" + core.getServerPrefix(m.guild.id) + "packs`.")
                .addFields(
                    {
                        "name": "PACK: 0, COST: 2 votes",
                        "value": "Add in any server you want a song longer than 10 minutes (but shorter than 20 minutes). When you try to add a song longer than 10 minutes, you will be able to use your pack. [`" + core.getServerPrefix(m.guild.id) + "add`]"
                    },
                    {
                        "name": "PACK: 1, COST: 5 votes",
                        "value": "Get another song slot for the server. When you try to add a song when there are no more available slots for the server, you will be able to use your pack. [`" + core.getServerPrefix(m.guild.id) + "add`]"
                    },
                    {
                        "name": "PACK: 2, COST: 2 votes",
                        "value": "Enable queue in your server to loop your whole song list and not only one song. [`" + core.getServerPrefix(m.guild.id) + "queue`]"
                    },
                    {
                        "name": "PACK: 3, COST: 2 votes",
                        "value": "Enable song shuffle in your server to loop your songs randomly one after the other. **`Warning`**, this feature only works together with song queue. [`" + core.getServerPrefix(m.guild.id) + "shuffle`]"
                    },
                    {
                        "name": "PACK: 4, Only via RadioBot Pay",
                        "value": "Add a song of any length or even a live video to your server. Available through [RadioBot Pay](https://pay.theradiobot.com). [`" + core.getServerPrefix(m.guild.id) + "add`]"
                    }
                );

                m.channel.send(e);
        } catch (e) {
            core.logs.log("ERROR! Executing vote command: " + e, "DISCORD", core.logs.LogFile.ERROR_LOG);
        }
    }
};