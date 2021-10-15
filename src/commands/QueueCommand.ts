import discord from 'discord.js';
import RadiobotDiscord from '../discord/RadiobotDiscord';
import EmbedHelper from '../helpers/EmbedHelper';
import InteractionHelper from '../helpers/InteractionHelper';
import ServerManager from '../managers/ServerManager';
import VotePackManager, { VotePackType } from '../managers/VotePackManager';
import ICommand from '../utils/ICommand';

const QueueCommand: ICommand = {
    name: "queue",
    aliases: ["q"],
    description: "Enable/disable song queue",
    run: async (m: discord.Message, args: string[]): Promise<void> => {
        const server = ServerManager.getInstance().getServerById(m.guildId);
        if (!server) return;

        if (!server.isQueueAvailable()) {
            if (VotePackManager.getInstance().hasVotePack(m.author.id, VotePackType.Queue)) {
                const confirmation = await m.reply({ embeds: [ EmbedHelper.Info("To enable server queue you need to redeem a RadioPack type `" + VotePackType.Queue + "` (You have " + VotePackManager.getInstance().getVotePacksByUserId(m.author.id, VotePackType.Queue) + ")" + 
                                        " React to the message to confirm, wait to cancel.") ]});

                if (!(await InteractionHelper.awaitConfirmation(confirmation, m.author.id))) return;
                RadiobotDiscord.getInstance().sendStatus(m.author.username + " (" + m.author.id + ") just used a RadioPack `" + VotePackType.Queue + "`");
            } else {
                m.reply({ embeds: [ EmbedHelper.NOK("Your server does not have queue available. Check `" + server.getPrefix() + "vote`.") ]});
                return;
            }
        }

        server.setQueue(!server.isQueue());

        m.reply({ embeds: [ EmbedHelper.OK((server.isQueue() ? "Enabled" : "Disabled") + " song queue.") ]});
        RadiobotDiscord.getInstance().sendStatus("queue " + (server.isQueue() ? "enabled" : "disabled") + " in " + RadiobotDiscord.getInstance().resolveGuildNameAndId(server.getGuild()));
    }
};

export default QueueCommand;