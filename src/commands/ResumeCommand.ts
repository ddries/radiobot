import discord from 'discord.js';
import EmbedHelper from '../helpers/EmbedHelper';
import ServerManager, { ServerState } from '../managers/ServerManager';
import ICommand from '../utils/ICommand';

const ResumeCommand: ICommand = {
    name: "resume",
    aliases: ["r"],
    description: "Resume the current playing song.",
    run: (m: discord.Message, args: string[]): void => {
        const server = ServerManager.getInstance().getServerById(m.guildId);
        if (!server) return;

        if (!server.getSongs() || server.getSongs().length <= 0) {
            m.reply({ embeds: [ EmbedHelper.NOK("There aren't any songs yet!\nUse `" + server.getPrefix() + "add`.") ]});
            return;
        }

        switch (server.getState()) {
            case ServerState.Playing:
                m.reply({ embeds: [ EmbedHelper.NOK("I'm already playing.") ]});
                break;
            case ServerState.Paused:
                server.resume();
                m.react('▶️');
                break;
            default:
                m.reply({ embeds: [ EmbedHelper.NOK("Nothing is playing :(") ]});
                break;
        }
    }
};

export default ResumeCommand;