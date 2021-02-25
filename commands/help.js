
var core = require('./../core/core.js');
const { alias } = require('./add.js');

function generarDescripcion(client, comandos) {
    let desc = "";
    let array = client.commands.array();
    for (let i = 0; i < array.length; i++) {
        if (!comandos.includes(array[i].name)) continue;
        //if ((typeof array[i].show !== "undefined" && !array[i].show) && m.author.id != core.config.admin_id) continue;
        let aliasString = "";
        if (array[i].alias) {
            aliasString = "( ";
            for (let j = 0; j < array[i].alias.length; j++) {
                aliasString += core.discord.DISCORD_PREFIX + array[i].alias[j];
                if (j+1 < array[i].alias.length) {
                    aliasString += ", ";
                } else {
                    aliasString += " )";
                }
            }
        }

        desc += "**" + core.discord.DISCORD_PREFIX + array[i].name + "**: ";
        if (aliasString.length > 0)
            desc += aliasString + " ";
            
        desc += array[i].description + "\n\n";
    }

    return desc;
}

module.exports = {
    name: "help",
    alias: ["h"],
    description: "Shows all commands and their usage.",
    execute: (m, args, discord, client) => {
        if (args.length <= 0) {
            let e = new discord.MessageEmbed()
                .setURL("https://theradiobot.com")
                .setColor("#fc9c1e")
                .setFooter("RadioBot")
                .setTimestamp()
                .setAuthor("RadioBot", "https://theradiobot.com/img/icon.png", "https://theradiobot.com")
                .setDescription("RadioBot is an easy and completely free to use Discord bot. Add it to your server, pick up some songs and enjoy the best 24/7 music station!\n\nYou can add songs with `" + core.discord.DISCORD_PREFIX + "add` and play them with `" + core.discord.DISCORD_PREFIX + "song`. However, you have tons of more commands to play with.")
                .addFields(
                    {
                        "name": "Server Songs",
                        "value": "You will need to control the songs played. You can check all commands related to this with `" + core.discord.DISCORD_PREFIX + "help songs`."
                    },
                    {
                        "name": "Server list",
                        "value": "You will need to control your song list. You can check all commands related to this with `" + core.discord.DISCORD_PREFIX + "help lists`."
                    },
                    {
                        "name": "Utility",
                        "value": "There are also some commands very useful. You can check them with `" + core.discord.DISCORD_PREFIX + "help util`."
                    },
                    {
                        "name": "Voting and Benefits",
                        "value": "Do you want more from RadioBot? Do you want to surpass the limits? Check voting and benefits with with `" + core.discord.DISCORD_PREFIX + "vote`."
                    },
                    {
                        "name": "Need fast help?",
                        "value": "Check the FAQ with `" + core.discord.DISCORD_PREFIX + "faq`.",
                        "inline": true
                    },
                    {
                        "name": "Not enough?",
                        "value": "Ask anything with `" + core.discord.DISCORD_PREFIX + "report`.",
                        "inline": true
                    },
                    {
                        "name": "Want to invite RadioBot?",
                        "value": "Get the invite link with `" + core.discord.DISCORD_PREFIX + "invite`.",
                        "inline": true
                    }
                );

            m.channel.send(e);
        } else if (args.length == 1) {
            let cat = args[0];
            if (cat === "songs") {
                let e = new discord.MessageEmbed()
                    .setURL("https://theradiobot.com")
                    .setColor("#fc9c1e")
                    .setFooter("RadioBot")
                    .setTimestamp()
                    .setAuthor("RadioBot", "https://theradiobot.com/img/icon.png", "https://theradiobot.com")
                    .setDescription(generarDescripcion(client, ["song", "search", "pause", "resume", "next", "np", "info"]));

                m.channel.send(e);
            } else if (cat === "lists") {
                let e = new discord.MessageEmbed()
                    .setURL("https://theradiobot.com")
                    .setColor("#fc9c1e")
                    .setFooter("RadioBot")
                    .setTimestamp()
                    .setAuthor("RadioBot", "https://theradiobot.com/img/icon.png", "https://theradiobot.com")
                    .setDescription(generarDescripcion(client, ["add", "remove", "list", "channel", "dc", "queue", "clear"]));

                m.channel.send(e);
            } else if (cat === "util") {
                let e = new discord.MessageEmbed()
                    .setURL("https://theradiobot.com")
                    .setColor("#fc9c1e")
                    .setFooter("RadioBot")
                    .setTimestamp()
                    .setAuthor("RadioBot", "https://theradiobot.com/img/icon.png", "https://theradiobot.com")
                    .setDescription(generarDescripcion(client, ["help", "invite", "report", "cancel", "faq", "ping"]));

                m.channel.send(e);
            } else {
                core.discord.notify(core.discord.NotifyType.Error, m.channel, {
                    description: "We could not find that category! (" + core.discord.DISCORD_PREFIX + "help)"
                });
            }
        } else {
            core.discord.notify(core.discord.NotifyType.Error, m.channel, {
                description: "USAGE: " + core.discord.DISCORD_PREFIX + "help [optional: CATEGORY]"
            });
        }
    }
};