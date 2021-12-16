import discord from 'discord.js';
import RadiobotDiscord from '../discord/RadiobotDiscord';
import EmbedHelper from '../helpers/EmbedHelper';
import InteractionHelper from '../helpers/InteractionHelper';
import PremiumManager from '../managers/PremiumManager';
import ServerManager from '../managers/ServerManager';
import VotePackManager, { VotePackType } from '../managers/VotePackManager';
import ICommand from '../utils/ICommand';

const ShuffleCommand: ICommand = {
    name: "shuffle",
    description: "Enable/disable song shuffle",
    run: async (m: discord.Message, args: string[]): Promise<void> => {
        const server = ServerManager.getInstance().getServerById(m.guildId);
        if (!server) return;

        // If the user is premium
        // fuck off, they can do whatever they want

        if (!PremiumManager.getInstance().getUserIsPremium(m.author.id)) {
            if (!server.isShuffleAvailable()) {
                if (VotePackManager.getInstance().hasVotePack(m.author.id, VotePackType.Shuffle)) {
                    const confirmation = await m.reply({ embeds: [ EmbedHelper.Info("To enable server shuffle you need to redeem a RadioPack type `" + VotePackType.Shuffle + "` (You have " + VotePackManager.getInstance().getVotePacksByUserId(m.author.id, VotePackType.Shuffle) + ")" + 
                                            " React to the message to confirm, wait to cancel.") ]});
    
                    if (!(await InteractionHelper.awaitConfirmation(confirmation, m.author.id))) return;
                    RadiobotDiscord.getInstance().sendStatus(m.author.username + " (" + m.author.id + ") just used a RadioPack `" + VotePackType.Shuffle + "`");
                } else {
                    m.reply({ embeds: [ EmbedHelper.NOK("Your server does not have shuffle available. Check `" + server.getPrefix() + "vote`.") ]});
                    return;
                }
            }
        }

        server.setShuffle(!server.isShuffle());

        m.reply({ embeds: [ EmbedHelper.OK((server.isShuffle() ? "Enabled" : "Disabled") + " song shuffle.") ]});
        RadiobotDiscord.getInstance().sendStatus("shuffle " + (server.isShuffle() ? "enabled" : "disabled") + " in " + RadiobotDiscord.getInstance().resolveGuildNameAndId(server.getGuild()));
    }
};

export default ShuffleCommand;