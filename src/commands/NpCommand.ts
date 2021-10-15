import discord from 'discord.js';
import EmbedHelper from '../helpers/EmbedHelper';
import ServerManager, { ServerState } from '../managers/ServerManager';
import ICommand from '../utils/ICommand';

const NpCommand: ICommand = {
    name: "np",
    description: "Display the currently playing song in your server.",
    run: (m: discord.Message, args: string[]): void => {
        const server = ServerManager.getInstance().getServerById(m.guildId);
        if (!server) return;

        if (server.getState() != ServerState.Playing && server.getState() != ServerState.Paused) {
            m.reply({ embeds: [ EmbedHelper.NOK("There has to be something playing first (" + server.getPrefix() + "song)") ]});
            return;
        }

        const song = server.getPlayingSong();
        const embed = EmbedHelper.singleSong(song);

        let description = embed.description;

        const queue = server.isQueue();
        const shuffle = server.isShuffle();
        const paused = server.getState() == ServerState.Paused;

        if (queue || shuffle) description += '\n';

        if (paused)
            embed.setTitle('⏸️ ' + embed.title);

        if (queue)
            description += '🔁 Queue is enabled!\n';

        if (shuffle)
            description += '🔀 Shuffle is enabled!';


        m.reply({ embeds: [ embed.setDescription(description) ]});
    }
};

export default NpCommand;