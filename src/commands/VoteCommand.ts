import discord from 'discord.js';
import ServerManager from '../managers/ServerManager';
import VoteManager from '../managers/VoteManager';
import VotePackManager from '../managers/VotePackManager';
import RadioBot from '../RadioBot';
import ICommand from '../utils/ICommand';

const VoteCommand: ICommand = {
    name: "vote",
    description: "Display information about the voting system",
    run: (m: discord.Message, args: string[]): void => {
        const server = ServerManager.getInstance().getServerById(m.guildId);
        if (!server) return;

        let userPacks = 0;
        if (VotePackManager.getInstance().getAllVotePacksByUserId(m.author.id).size >= 0)
            userPacks = VotePackManager.getInstance().getAllVotePacksByUserId(m.author.id).size;

        let e = new discord.MessageEmbed()
            .setURL("https://top.gg/bot/778044858760953866/vote")
            .setColor("#fc9c1e")
            .setFooter("RadioBot")
            .setTimestamp()
            .setAuthor("RadioBot", RadioBot.WebUrl + "img/icon.png", "https://top.gg/bot/778044858760953866/vote")
            .setDescription("**[Vote here](https://top.gg/bot/778044858760953866/vote)** for **RadioBot** and get benefits! You can vote for free for RadioBot on Top.gg. When you reach 2 or more votes, you can spend your collected votes for special benefits for your server!\n\n"
            + "You can get these benefits using `" + server.getPrefix() + "voteuse [pack]`, being `[pack]` the feature you want to unlock, for example: `" + server.getPrefix() + "voteuse 0`, to unlock a slot for a longer song.\n\n" +
            "Packs are redeemed while you use RadioBot. That means that you will be able to redeem the **PACK 0** when you try to add a song longer than 10 minutes and shorter than 20 minutes, and you own a **PACK 0**." + 
            "\n\n**" + m.author.username + "**, you have **" + VoteManager.getInstance().getVotesByUserId(m.author.id) + "** vote(s). You have **" + userPacks + "** pack(s), you may check them with `" + server.getPrefix() + "packs`.")
            .addFields(
                {
                    "name": "PACK: 0, COST: 2 votes",
                    "value": "Add in any server you want a song longer than 10 minutes (but shorter than 20 minutes). When you try to add a song longer than 10 minutes, you will be able to use your pack. [`" + server.getPrefix() + "add`]"
                },
                {
                    "name": "PACK: 1, COST: 2 votes",
                    "value": "Get another song slot for the server. When you try to add a song when there are no more available slots for the server, you will be able to use your pack. [`" + server.getPrefix() + "add`]"
                },
                {
                    "name": "PACK: 2, COST: 2 votes",
                    "value": "Enable queue in your server to loop your whole song list and not only one song. [`" + server.getPrefix() + "queue`]"
                },
                {
                    "name": "PACK: 3, COST: 2 votes",
                    "value": "Enable song shuffle in your server to loop your songs randomly one after the other. [`" + server.getPrefix() + "shuffle`]"
                },
                {
                    "name": "PACK: 4, Only via RadioBot Pay",
                    "value": "Add a song of any length or even a live video to your server. Available through [RadioBot Pay](https://pay.theradiobot.com). [`" + server.getPrefix() + "add`]"
                }
            );

        m.channel.send({ embeds: [e]});
    }
};

export default VoteCommand;