
var core = require('./../core/core.js');

module.exports = {
    name: "list",
    description: "Show the added songs in your server.",
    execute: (m, args, discord) => {
        if (!core.getServerSongs(m.guild.id) || core.getServerSongs(m.guild.id).length <= 0) {
            core.discord.notify(core.discord.NotifyType.Error, m.channel, {
                description: "There aren't any songs added in " + m.guild.name + " yet! Try adding some with **" + core.discord.DISCORD_PREFIX + "add**"
            });
            return;
        }
        
        let embeds = core.buildSongList(m.guild, discord);
        for (let i = 0; i < embeds.length; i++) {
            m.channel.send(embeds[i]);
        }
    }
};