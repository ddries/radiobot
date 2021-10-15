import { Message } from "discord.js";
import RadiobotDiscord from "../discord/RadiobotDiscord";
import EmbedHelper from "../helpers/EmbedHelper";
import PrefixManager from "../managers/PrefixManager";
import ServerManager, { ServerState } from "../managers/ServerManager";
import ICommand from "../utils/ICommand";

const ChannelCommand: ICommand = {
    name: "channel",
    aliases: ["c"],
    description: "Shows or changes the channel where the bot is fixed.",
    run: (m: Message, args: string[]): void => {
        const server = ServerManager.getInstance().getServerById(m.guildId);
        if (!server) return;

        if (args.length <= 0) {
            const serverChannel = server.getChannelId();
            if (!serverChannel || serverChannel.length <= 0) {
                m.reply({ embeds: [ EmbedHelper.NOK("I'm not fixed to any channel yet!\nUse `" + server.getPrefix() + "channel [channel name / part of name]`.") ]});
                return;
            } else {
                const channelName = server.getGuild().channels.cache.get(server.getChannelId())?.name;
                if (channelName) {
                    m.reply({ embeds: [ EmbedHelper.OK("Currently fixed in: `" + channelName + "`.").setFooter("Use " + server.getPrefix() + "channel [channel name / part of name] to change it.") ]});
                }
            }
        } else {
            let newChannelName: string = "";
            for (let i = 0; i < args.length; i++) {
                newChannelName += args[i];

                if (i < args.length - 1)
                    newChannelName += " ";
            }

            const guildChannels = server.getGuild().channels.cache;
            for (const [ channelId, channelObject ] of guildChannels) {
                if ((channelObject.type == 'GUILD_VOICE' || channelObject.type == 'GUILD_STAGE_VOICE') && (channelObject.name.toLowerCase() == newChannelName.toLowerCase() || channelObject.name.toLowerCase().includes(newChannelName.toLowerCase()))) {
                    if (!channelObject.permissionsFor(RadiobotDiscord.getInstance().Client.user.id).has('CONNECT', false)) {
                        m.reply({ embeds: [ EmbedHelper.NOK("Cannot set channel to `" + channelObject.name + "`: I don't have permissions to join that channel.") ]});
                        return;
                    }

                    server.setChannelId(channelId);

                    if (server.getPlayingSongId() >= 0 && server.getState() == ServerState.Playing)
                        server.joinVoice(true);

                    m.reply({ embeds: [ EmbedHelper.OK("Changed fixed channel to `" + channelObject.name + "`") ]});
                    return;
                }
            }

            m.reply({ embeds: [ EmbedHelper.NOK("Could not find any voice channel with that name.") ]});
        }
    }
};

export default ChannelCommand;