import ICommand from "../utils/ICommand";
import discord from 'discord.js';
import EmbedHelper from "../helpers/EmbedHelper";
import ServerManager from "../managers/ServerManager";

const InfoCommand: ICommand = {
    name: "info",
    description: "Display information about the specified song.",
    run: (m: discord.Message, args: string[]): void => {
        const server = ServerManager.getInstance().getServerById(m.guildId);
        if (!server) return;

        if (!server.getSongs() || server.getSongs().length <= 0) {
            m.reply({ embeds: [ EmbedHelper.NOK("There aren't any songs yet!\nUse `" + server.getPrefix() + "add`.") ]});
            return;
        }

        if (args.length <= 0) {
            m.reply({ embeds: [ EmbedHelper.NOK("Usage: " + server.getPrefix() + "info [song number]") ]});
            return;
        }

        const index = parseInt(args[0]) - 1;
        const song = server.getSongAt(index);

        if (!song) {
            m.reply({ embeds: [ EmbedHelper.NOK("Could not find any song with that index!") ]});
            return;
        }

        m.reply({ embeds: [ EmbedHelper.singleSong(song) ]});
    }
};

export default InfoCommand;