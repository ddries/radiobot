import discord from 'discord.js';
import EmbedHelper from '../helpers/EmbedHelper';
import InteractionHelper from '../helpers/InteractionHelper';
import ServerManager from '../managers/ServerManager';
import SongManager from '../managers/SongManager';
import FunctionUtils from '../utils/FunctionUtils';
import ICommand from '../utils/ICommand';

const EditCommand: ICommand = {
    name: "edit",
    description: "Edit the name of the specified song",
    run: async (m: discord.Message, args: string[]): Promise<void> => {
        const server = ServerManager.getInstance().getServerById(m.guildId);
        if (!server) return;

        if (args.length < 2) {
            m.reply({ embeds: [ EmbedHelper.NOK("Usage: " + server.getPrefix() + "edit [song number] [new name]") ]});
            return;
        }

        const songIndex = parseInt(args.shift()) - 1;
        const song = server.getSongAt(songIndex);

        if (!song || isNaN(songIndex)) {
            m.reply({ embeds: [ EmbedHelper.NOK("Could not find any song with that index!") ]});
            return;
        }

        let songName = FunctionUtils.sanitizeStringForBd(args.join(" "));

        if (songName.length > 50) {
            m.reply({ embeds: [ EmbedHelper.NOK("Maximum length for song name is 50 characters.") ]});
            return;
        }

        const confirmation = await m.reply({ embeds: [ EmbedHelper.Info("You are about to edit the name of the following song:\n`" + song.getName() + "` **=>** `" + songName + "`.\n" + 
                                        "React to the message to confirm, wait to cancel.") ]});

        if (!(await InteractionHelper.awaitConfirmation(confirmation, m.author.id))) return;

        SongManager.getInstance().editSongName(song, songName);
        m.reply({ embeds: [ EmbedHelper.OK("Successfully updated song to [" + song.getName() + "](" + song.getUrl() + ").") ]});
    }
};

export default EditCommand;