import discord, { TextChannel } from 'discord.js';
import RadiobotDiscord from '../discord/RadiobotDiscord';
import EmbedHelper from '../helpers/EmbedHelper';
import ReportManager from '../managers/ReportManager';
import ServerManager from '../managers/ServerManager';
import ICommand from '../utils/ICommand';

const ReportCommand: ICommand = {
    name: "report",
    description: "Report a bug or a message to the Bot developers",
    run: (m: discord.Message, args: string[]): void => {
        const server = ServerManager.getInstance().getServerById(m.guildId);
        if (!server) return;

        if (args.length <= 0) {
            m.reply({ embeds: [ EmbedHelper.NOK("Usage: " + server.getPrefix() + "report [message]") ]});
            return;
        }

        const text = args.join(" ");

        if (text.length >= 100) {
            m.reply({ embeds: [ EmbedHelper.NOK("Maximum report length is 100 characters") ]});
            return;
        }

        const id = ReportManager.getInstance().create(m.channel as TextChannel);

        m.reply({ embeds: [ EmbedHelper.OK("Your report has been sent. The team will reply as soon as possible.") ]});
        RadiobotDiscord.getInstance().sendAdmin('**New report**\n\nSource: `' + RadiobotDiscord.getInstance().resolveGuildNameAndId(server.getGuild()) + '`.\nUser: `' + m.author.tag + '`.\nReport Id: `' + id + '`.\nText: `' + text + '`.');
    }
};

export default ReportCommand;