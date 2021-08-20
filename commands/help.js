
const { MessageActionRow, MessageButton } = require('discord.js');
var core = require('./../core/core.js');

function generarDescripcion(m, client, comandos) {
    let desc = "";
    client = m.client;
    let array = [...client.commands];
    for (let i = 0; i < array.length; i++) {
        if (!comandos.includes(array[i][0])) continue;

        const cmd = array[i][1];

        //if ((typeof array[i].show !== "undefined" && !array[i].show) && m.author.id != core.config.admin_id) continue;
        let aliasString = "";
        if (cmd.alias) {
            aliasString = "( ";
            for (let j = 0; j < cmd.alias.length; j++) {
                aliasString += core.getServerPrefix(m.guild.id) + cmd.alias[j];
                if (j+1 < cmd.alias.length) {
                    aliasString += ", ";
                } else {
                    aliasString += " )";
                }
            }
        }

        desc += "**" + core.getServerPrefix(m.guild.id) +cmd.name + "**: ";
        if (aliasString.length > 0)
            desc += aliasString + " ";
            
        desc += cmd.description + "\n\n";
    }

    return desc;
}

const songsCmds = ["play", "song", "search", "pause", "resume", "next", "np", "info"];
const listsCmds = ["play", "add", "remove", "list", "channel", "dc", "queue", "clear", "shuffle"];
const utilsCmds = ["help", "invite", "report", "cancel", "faq", "ping", "prefix", "vote"];

module.exports = {
    name: "help",
    alias: ["h"],
    description: "Shows all commands and their usage.",
    execute: async (m, args, discord, client) => {
        try {
            if (args.length <= 0) {
                const rowOptions = new MessageActionRow()
                    .addComponents(
                        [
                            new MessageButton()
                                .setStyle('SECONDARY')
                                .setLabel('Songs')
                                .setCustomId('help-songs'),
                            new MessageButton()
                                .setStyle('SECONDARY')
                                .setLabel('Lists')
                                .setCustomId('help-lists'),
                            new MessageButton()
                                .setStyle('SECONDARY')
                                .setLabel('Utility')
                                .setCustomId('help-util'),
                            new MessageButton()
                                .setStyle('LINK')
                                .setLabel('Invite')
                                .setURL('https://theradiobot.com/join'),
                            new MessageButton()
                                .setStyle('LINK')
                                .setLabel('Vote')
                                .setURL('https://top.gg/bot/778044858760953866/vote')
                        ]
                    );
    
                let e = new discord.MessageEmbed()
                    .setURL("https://theradiobot.com")
                    .setColor("#fc9c1e")
                    .setFooter("RadioBot")
                    .setTimestamp()
                    .setAuthor("RadioBot", "https://theradiobot.com/img/icon.png", "https://theradiobot.com")
                    .setDescription("RadioBot is an easy and completely free to use Discord bot. Add it to your server, pick up some songs and enjoy the best 24/7 music station!\n\nYou can add songs with `" + core.getServerPrefix(m.guild.id) + "add` and play them with `" + core.getServerPrefix(m.guild.id) + "song`. Or simply use `" + core.getServerPrefix(m.guild.id) + "play` to quickly play the song you want!. However, you have tons of more commands to play with.")
                    .addFields(
                        {
                            "name": "Server Songs",
                            "value": "You will need to control the songs played."
                        },
                        {
                            "name": "Server list",
                            "value": "You will need to control your song list."
                        },
                        {
                            "name": "Utility",
                            "value": "There are also some commands very useful."
                        },
                        {
                            "name": "Voting and Benefits",
                            "value": "Do you want more from RadioBot? Do you want to surpass the limits? Check voting and benefits with with `" + core.getServerPrefix(m.guild.id) + "vote`."
                        },
                        {
                            "name": "Need fast help?",
                            "value": "Check the FAQ with `" + core.getServerPrefix(m.guild.id) + "faq`.",
                            "inline": true
                        },
                        {
                            "name": "Not enough?",
                            "value": "Ask anything with `" + core.getServerPrefix(m.guild.id) + "report`.",
                            "inline": true
                        }
                    );
    
                const reply = await m.channel.send({ embeds: [e], components: [rowOptions]});
    
                const filter = (b) => b.user.id === m.author.id;
                const col = reply.createMessageComponentCollector({
                    filter,
                    time: 120 * 1000
                });
    
                col.on('collect', (int) => {
                    int.deferUpdate().then(async () => {
                        let array = [];
                        switch (int.customId) {
                            case 'help-songs':
                                array = songsCmds;
                                break;
                            case 'help-lists':
                                array = listsCmds;
                                break;
                            case 'help-util':
                                array = utilsCmds;
                                break;
                        }
        
                        await int.editReply({
                            embeds: [
                                new discord.MessageEmbed()
                                    .setURL("https://theradiobot.com")
                                    .setColor("#fc9c1e")
                                    .setFooter("RadioBot")
                                    .setTimestamp()
                                    .setAuthor("RadioBot", "https://theradiobot.com/img/icon.png", "https://theradiobot.com")
                                    .setDescription(generarDescripcion(m, client, array))
                            ]
                        })
                    }).catch(e => {
                        core.logs.log("Could not send interaction help: " + e, 'ERROR', core.logs.LogFile.ERROR_LOG);
                    });
                });
            }
        } catch (e) {
            m.reply("there was an error with that command!");
        }
    }
};