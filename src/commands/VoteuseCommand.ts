import discord from 'discord.js';
import RadiobotDiscord from '../discord/RadiobotDiscord';
import EmbedHelper from '../helpers/EmbedHelper';
import ServerManager from '../managers/ServerManager';
import VoteManager from '../managers/VoteManager';
import VotePackManager, { VotePackType } from '../managers/VotePackManager';
import ICommand from '../utils/ICommand';

const VoteuseCommand: ICommand = {
    name: "voteuse",
    description: "Spend your RadioBot votes for benefits",
    run: (m: discord.Message, args: string[]): void => {
        const server = ServerManager.getInstance().getServerById(m.guildId);
        if (!server) return;

        if (args.length <= 0) {
            m.reply({ embeds: [ EmbedHelper.NOK("Usage: " + server.getPrefix() + "voteuse [pack]") ]});
            return;
        }

        const userVotes = VoteManager.getInstance().getVotesByUserId(m.author.id);
        let votesNeeded = 0;
        const pack = parseInt(args[0]);

        if (isNaN(pack)) {
            m.reply({ embeds: [ EmbedHelper.NOK("Usage: " + server.getPrefix() + "voteuse [pack]") ]});
            return;
        }

        switch (pack) {
            case VotePackType.LongerSong:
            case VotePackType.Queue:
            case VotePackType.SongSlot:
            case VotePackType.Shuffle:
                votesNeeded = 2;
        }

        if (votesNeeded <= 0) {
            m.reply({ embeds: [ EmbedHelper.NOK("RadioPack not found, please check all RadioPacks with `" + server.getPrefix() + "vote`.") ]});
            return;
        }

        VoteManager.getInstance().setVotesByUserId(m.author.id, (userVotes - votesNeeded));
        VotePackManager.getInstance().addVotePack(m.author.id, pack);

        m.reply({ embeds: [ EmbedHelper.OK("Successfully purchased a RadioPack type `" + pack + "`. You may see what you got with `" + server.getPrefix() + "vote`.") ]});
        RadiobotDiscord.getInstance().sendStatus(m.author.username + " (" + m.author.id + ") just purchased a RadioPack `" + pack + "`");
    }
};

export default VoteuseCommand;