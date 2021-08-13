
var core = require('./../core/core.js');
const md5 = require('md5');

module.exports = {
    name: "export",
    description: "Exports the server song list to another server.",
    execute: (m, args, discord, client) => {
        if (m.author.id != core.config.admin_id) {
            return;
        }

        if (!core.getServerSongs(m.guild.id) || core.getServerSongs(m.guild.id).length <= 0) {
            core.discord.notify(core.discord.NotifyType.Error, m.channel, {
                description: "There aren't any songs added in " + m.guild.name + " yet! Try adding some with **" + core.getServerPrefix(m.guild.id) + "add**"
            });
            return;
        }
        
        let songArray = [];
        let serverSongs = core.getServerSongs(m.guild.id);
        for (let s of serverSongs) {
            songArray.push(core.getVideoId(s[0]));
        }

        const code = md5(JSON.stringify(songArray));
        const identifier = code.substr(0, 10);

        core.mysql.query("INSERT INTO exports(code, json) VALUES('" + identifier + "', '" + JSON.stringify(songArray) + "')");
        m.reply("done! You can now import this server song list with: `" + core.discord.DEFAULT_DISCORD_PREFIX + "import " + identifier + "`");
    }
};