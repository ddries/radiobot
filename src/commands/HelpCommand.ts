import discord, { MessageActionRow, MessageButton } from 'discord.js';
import RadiobotDiscord from '../discord/RadiobotDiscord';
import { EmbedColor } from '../helpers/EmbedHelper';
import ServerManager from '../managers/ServerManager';
import RadioBot from '../RadioBot';
import ICommand from '../utils/ICommand';

const HelpCommand: ICommand = {
    name: "help",
    description: "Display all commands and their usage",
    aliases: ["h"],
    run: async (m: discord.Message, args: string[]): Promise<void> => {
        const server = ServerManager.getInstance().getServerById(m.guildId);
        if (!server) return;
        
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
                        .setURL(RadioBot.WebUrl + 'join'),
                    new MessageButton()
                        .setStyle('LINK')
                        .setLabel('Vote')
                        .setURL('https://top.gg/bot/778044858760953866/vote')
                ]
        );

        const e = new discord.MessageEmbed()
            .setURL(RadioBot.WebUrl)
            .setColor(EmbedColor.Info)
            .setFooter("RadioBot")
            .setTimestamp()
            .setAuthor("RadioBot", RadioBot.WebUrl + "img/icon.png", RadioBot.WebUrl)
            .setDescription("RadioBot is an easy and completely free to use Discord bot. Add it to your server, pick up some songs and enjoy the best 24/7 music station!\n\nYou can add songs with `" + server.getPrefix() + "add` and play them with `" + server.getPrefix() + "song`. However, you have tons of more commands to play with.")
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
                    "value": "Do you want more from RadioBot? Do you want to surpass the limits? Check voting and benefits with with `" + server.getPrefix() + "vote`."
                },
                {
                    "name": "Need fast help?",
                    "value": "Check the FAQ with `" + server.getPrefix() + "faq`.",
                    "inline": true
                },
                {
                    "name": "Not enough?",
                    "value": "Ask anything with `" + server.getPrefix() + "report`.",
                    "inline": true
                }
        );

        const reply = await m.channel.send({ embeds: [e], components: [rowOptions]});
    
        const filter = (b) => b.user.id === m.author.id;
        const collector = reply.createMessageComponentCollector({
            filter,
            time: 120 * 1000
        });

        collector.on('collect', (int) => {
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
                            .setURL(RadioBot.WebUrl)
                            .setColor(EmbedColor.Info)
                            .setFooter("RadioBot")
                            .setTimestamp()
                            .setAuthor("RadioBot", RadioBot.WebUrl + "img/icon.png", RadioBot.WebUrl)
                            .setDescription(generateCommandDescription(array, server.getPrefix()))
                    ]
                })
            }).catch(e => {
                console.log(e);
            });
        });
    }
};

const songsCmds = ["edit", "song", "search", "pause", "resume", "next", "np", "info"];
const listsCmds = ["edit", "add", "remove", "list", "channel", "dc", "queue", "clear", "shuffle"];
const utilsCmds = ["help", "invite", "report", "faq", "ping", "prefix", "vote", "voteuse", "packs"];

function generateCommandDescription(commands: string[], serverPrefix) {
    let description = "";
    for (let [commandName, commandObject] of RadiobotDiscord.getInstance().getAllCommands()) {
        if (!commands.includes(commandName)) continue;

        let aliasText = "";
        if (commandObject.aliases?.length > 0) {
            aliasText = "( ";
            for (let i = 0; i < commandObject.aliases.length; i++) {
                aliasText += serverPrefix + commandObject.aliases[i];
                
                if (i < commandObject.aliases.length - 1) aliasText += ", ";
                else aliasText += " )";
            }
        }

        description += "`" + serverPrefix + commandName + "`";

        if (aliasText.length > 0)
            description += " " + aliasText;

        description += " " + commandObject.description + "\n";
    }

    return description;
}

export default HelpCommand;