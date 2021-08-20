var core = require('./../core/core.js');

function process_next(i, results, discord, embed, m) {
    core.waitForUserResponse(m.author, m.channel, discord, (r, _m) => {
        if (r == 'n' || r == 'next') {
            _m.delete();
            if (i == results.length) {
                core.discord.notify(core.discord.NotifyType.Error, m.channel, {
                    description: "There are not any more results"
                });
                return;
            }
            i++;
            let embed_new = new discord.MessageEmbed()
                .setColor("#fc9c1e")
                .setTitle("I found... " + results[i].title)
                .setFooter('RadioBot')
                .setTimestamp();

            embed_new.setURL(results[i].url);
            embed_new.setImage(results[i].bestThumbnail.url);
            embed_new.setDescription("Right click the title to get the link.\n**Not what you were looking for?** Type `n` or `next`.");

            embed.edit(embed_new);
            process_next(i, results, discord, embed, m);
        } else {
            core.clearUserWaitingForResponse(m.channel.guild.id);
        }
    }, false, true);
}

module.exports = {
    name: "search",
    alias: ["sr"],
    description: "Searches Youtube for the specified song title or video.",
    execute: (m, args, discord, client) => {
        if (args.length < 1) {
            core.discord.notify(core.discord.NotifyType.Error, m.channel, {
                description: "USAGE: " + core.getServerPrefix(m.guild.id) + "search [search input]"
            });
            return;
        }

        if (core.isServerOnCooldown(m.guild.id)) {
            core.discord.notify(core.discord.NotifyType.Error, m.channel, {
                description: "Please wait a bit to run this command"
            });
            return;
        }

        core.setServerCooldown(m.guild.id, 10*1000);
        m.reply("searching...");
        let text = "";
        for (let i = 0; i < args.length; i++) {
            text += args[i];
            if (i+1 != args.length)
                text += " ";
        }

        core.ytsr.getFilters(text).then(fil => {
            core.ytsr(fil.get('Type').get('Video').url, {pages: 1}).then(s => {
                let results = s.items;
    
                let embed = new discord.MessageEmbed()
                    .setColor("#fc9c1e")
                    .setTitle("I found... " + results[0].title)
                    .setFooter('RadioBot')
                    .setTimestamp();
    
                embed.setURL(results[0].url);
                embed.setImage(results[0].bestThumbnail.url);
                embed.setDescription("Right click the title to get the link.\n**Not what you were looking for?** Type `n` or `next`.");

                m.channel.send({ embeds: [embed]}).then(_ => {
                    process_next(0, results, discord, _, m);
                });
            }); 
        });
    }
};