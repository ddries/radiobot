import discord from 'discord.js';
import EmbedHelper from '../helpers/EmbedHelper';
import InteractionHelper from '../helpers/InteractionHelper';
import ServerManager from '../managers/ServerManager';
import ICommand from '../utils/ICommand';

const ClearCommand: ICommand = {
    name: "clear",
    description: "Clear your whole server list",
    run: async (m: discord.Message, args: string[]): Promise<void> => {
        const server = ServerManager.getInstance().getServerById(m.guildId);
        if (!server) return;

        if (!server.getSongs() || server.getSongs().length <= 0) {
            m.reply({ embeds: [ EmbedHelper.NOK("There aren't any songs yet!\nUse `" + server.getPrefix() + "add`.") ]});
            return;
        }

        const confirmation = await m.reply({ embeds: [ EmbedHelper.Info("You are about to delete your whole server list (" + m.guild.name + ")." + 
                                        " React to the message to continue, wait to cancel.") ]});

        if (!(await InteractionHelper.awaitConfirmation(confirmation, m.author.id))) return;


        // let songs = [...server.getSongs()];
        // for (const song of songs) {
        //     server.removeSong(song);
        // }

        server.clearSongs();
        server.disconnect();

        m.reply({ embeds: [ EmbedHelper.OK("All songs have been deleted.") ]});
    }
};

export default ClearCommand;