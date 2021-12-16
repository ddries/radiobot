import discord, { Constants } from 'discord.js';
import EmbedHelper from '../helpers/EmbedHelper';
import InteractionHelper from '../helpers/InteractionHelper';
import PremiumManager from '../managers/PremiumManager';
import ServerManager from '../managers/ServerManager';
import RadioBot from '../RadioBot';
import ICommand from '../utils/ICommand';
import PatreonApi from '../utils/PatreonApi';

const ActivatePremium: ICommand = {
    name: "activatepremium",
    description: "Activate premium (must have patreon connected to discord)",
    run: async (m: discord.Message, args: string[]): Promise<void> => {
        const server = ServerManager.getInstance().getServerById(m.guildId);
        if (!server) return;

        if (server.getId() != "792468085033533461") {
            return;
        }

        if (m.channelId != "920996487880667156") {
            return;
        }

        if (PremiumManager.getInstance().getUserIsPremium(m.author.id)) {
            m.reply({ embeds: [ EmbedHelper.NOK("You are already premium.") ]});
            return;
        }

        const pledgeId: string = await PatreonApi.getPledgeIdByDiscordUserId(m.author.id);

        if (!pledgeId || pledgeId.length <= 0) {
            m.reply({ embeds: [ EmbedHelper.NOK("You are not subscribed to any Patreon tier! Please, make sure you have [connected your Patron account with Discord](https://support.patreon.com/hc/en-us/articles/212052266-How-do-I-connect-Discord-to-Patreon-Patron-).") ]});
            return;
        }

        const r = await m.reply({ embeds: [ EmbedHelper.Premium("You are about to activate your Premium. React to the message to continue, wait to cancel.") ]});
        if (!(await InteractionHelper.awaitConfirmation(r, m.author.id))) return;

        PremiumManager.getInstance().activatePremiumForUser(m.author.id);
        m.reply({ embeds: [ EmbedHelper.OK("Successfully activated premium for <@" + m.author.id + ">!\nIf you have any question, please don't hesitate to ask your have a look to the FAQ (`" + RadioBot.DefaultPrefix + "faq`)") ]});
    }
};

export default ActivatePremium;