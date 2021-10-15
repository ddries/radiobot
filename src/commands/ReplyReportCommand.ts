import discord, { TextChannel } from 'discord.js';
import RadiobotDiscord from '../discord/RadiobotDiscord';
import EmbedHelper from '../helpers/EmbedHelper';
import ReportManager from '../managers/ReportManager';
import ServerManager from '../managers/ServerManager';
import ICommand from '../utils/ICommand';

const ReplyReportCommand: ICommand = {
    name: "replyreport",
    aliases: ["rr"],
    adminOnly: true,
    description: "Attend an admin report",
    run: (m: discord.Message, args: string[]): void => {
        const server = ServerManager.getInstance().getServerById(m.guildId);
        if (!server) return;

        if (args.length <= 0) {
            m.reply({ embeds: [ EmbedHelper.NOK("Usage: " + server.getPrefix() + "report [report id] [message]") ]});
            return;
        }

        const id = parseInt(args.shift());

        if (isNaN(id)) {
            m.reply({ embeds: [ EmbedHelper.NOK("Invalid report id (must be a valid number)") ]});
            return;
        }

        const text = args.join(" ");

        if (text.length >= 100) {
            m.reply({ embeds: [ EmbedHelper.NOK("Maximum report answer length is 100 characters") ]});
            return;
        }

        if (!ReportManager.getInstance().attend(id, text)) {
            m.reply({ embeds: [ EmbedHelper.NOK("There has been an error attending the report") ]});
            return;
        }

        m.reply({ embeds: [ EmbedHelper.OK("Report attended") ]});
    }
};

export default ReplyReportCommand;