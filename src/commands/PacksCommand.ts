import discord from 'discord.js';
import EmbedHelper from '../helpers/EmbedHelper';
import ServerManager from '../managers/ServerManager';
import VotePackManager from '../managers/VotePackManager';
import RadioBot from '../RadioBot';
import ICommand from '../utils/ICommand';

const PacksCommand: ICommand = {
    name: "packs",
    description: "Display all your unlocked packs",
    run: (m: discord.Message, args: string[]): void => {
        const server = ServerManager.getInstance().getServerById(m.guildId);
        if (!server) return;

        if (VotePackManager.getInstance().getAllVotePacksByUserId(m.author.id).size <= 0) {
            m.reply({ embeds: [ EmbedHelper.NOK("You don't have any packs yet. Use `" + server.getPrefix() + "vote`.") ]});
            return;
        }

        let e = new discord.MessageEmbed()
            .setURL("https://top.gg/bot/778044858760953866/vote")
            .setColor("#fc9c1e")
            .setFooter("RadioBot")
            .setTimestamp()
            .setAuthor("RadioBot", RadioBot.WebUrl + "img/icon.png", "https://top.gg/bot/778044858760953866/vote");
            
        let desc = "Packs are redeemed while you use RadioBot. If you can take profit of any pack, it will let you know. For example, if you have a  **RadioPack 0** and you try to add a song of 15 minutes, it will prompt you if you want to use your pack.\n\nThese are your unlocked packs, **" + m.author.username + "**:\n\n";

        for (const [packId, count] of VotePackManager.getInstance().getAllVotePacksByUserId(m.author.id)) {
            desc += "➡️ You have **" + count + "** RadioPack(s) of type **" + packId + "**.\n\n";
        }

        e.setDescription(desc);

        m.reply({ embeds: [ e ]});
    }
};

export default PacksCommand;