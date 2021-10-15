import discord from 'discord.js';
import RadiobotDiscord from '../discord/RadiobotDiscord';
import EmbedHelper from '../helpers/EmbedHelper';
import ServerManager from '../managers/ServerManager';
import ICommand from '../utils/ICommand';

const PrefixCommand: ICommand = {
    name: "prefix",
    description: "Display or change the current prefix",
    run: (m: discord.Message, args: string[]): void => {
        const server = ServerManager.getInstance().getServerById(m.guildId);
        if (!server) return;

        if (args.length <= 0) {
            m.reply({ embeds: [ EmbedHelper.Info("Current prefix: `" + server.getPrefix() + "`.").setFooter("You can change it with " + server.getPrefix() + "prefix [new prefix]") ]});
            return;
        }

        const prefix = args[0];

        if (prefix.length > 10) {
            m.reply({ embeds: [ EmbedHelper.NOK("Maximum length is 10 characters.") ]});
            return;
        }

        server.setPrefix(prefix);
        m.react('✅');
        RadiobotDiscord.getInstance().sendStatus("changed prefix in " + RadiobotDiscord.getInstance().resolveGuildNameAndId(server.getGuild()) + " to " + prefix);
    }
};

export default PrefixCommand;