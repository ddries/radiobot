
var core = require('./../core/core.js');

module.exports = {
    name: "list",
    description: "Show the added songs in your server.",
    execute: (m, args, discord, client) => {
        if (!core.getServerSongs(m.guild.id) || core.getServerSongs(m.guild.id).length <= 0) {
            core.discord.notify(core.discord.NotifyType.Error, m.channel, {
                description: "There aren't any songs added in " + m.guild.name + " yet! Try adding some with **" + core.getServerPrefix(m.guild.id) + "add**"
            });
            return;
        }
        
        if (core.getServerSongs(m.guild.id).length > 25) {
            let page = 1;
            core.sendSongListAwaitReaction(m.author, m.channel, m.guild, discord, (r, msg) => {
                if (r.emoji.id == '825081129278111765') {
                    page++;
                    if (page > Math.ceil(core.getServerSongs(m.guild.id).length/core.SONGS_PER_EMBED))
                        page = 1;
                } else if (r.emoji.id == '825081080532172851') {
                    page--;
                    if (page < 1)
                        page = Math.ceil(core.getServerSongs(m.guild.id).length/core.SONGS_PER_EMBED);
                }
                
                msg.edit(core.buildSongList(m.guild, discord, page));
            }, client, page);
        } else {
            m.channel.send({ embeds: [core.buildSongList(m.guild, discord)]});
        }
    }
};