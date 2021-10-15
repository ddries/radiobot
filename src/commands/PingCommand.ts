import discord from 'discord.js';
import RadiobotDiscord from '../discord/RadiobotDiscord';
import EmbedHelper from '../helpers/EmbedHelper';
import ICommand from '../utils/ICommand';

const PingCommand: ICommand = {
    name: "ping",
    description: "Pong?",
    run: async (m: discord.Message, args: string[]): Promise<void> => {
        await m.reply("Pong :)!");
        m.reply({ embeds: [ EmbedHelper.Info("__Message latency:__ " + (Date.now() - m.createdTimestamp) + "ms\n__Discord latency:__ " + Math.round(RadiobotDiscord.getInstance().Client.ws.ping) + "ms").setTimestamp() ]});
    }
};

export default PingCommand;