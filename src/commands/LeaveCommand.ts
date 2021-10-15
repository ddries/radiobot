import ICommand from "../utils/ICommand";
import discord from 'discord.js';
import ServerManager, { ServerState } from "../managers/ServerManager";
import EmbedHelper from "../helpers/EmbedHelper";
import PrefixManager from "../managers/PrefixManager";

const LeaveCommand: ICommand = {
    name: "leave",
    aliases: ["dc"],
    description: "Disconnects the bot from the voice channel.",
    run: (m: discord.Message, args: string[]): void => {
        const server = ServerManager.getInstance().getServerById(m.guildId);
        if (!server) return;

        if (!server.getSongs() || server.getSongs().length <= 0) {
            m.reply({ embeds: [ EmbedHelper.NOK("There aren't any songs in " + server.getGuild().name + " yet! Add some with `" + server.getPrefix() + "add`") ]});
            return;
        }

        if (server.getState() == ServerState.Disconnected || server.getChannelId().length <= 0) {
            m.reply({ embeds: [ EmbedHelper.NOK("I'm already disconnected.") ]});
            return;
        }

        server.disconnect();

        m.react("👋");
    }
};

export default LeaveCommand;