import discord from 'discord.js';
import { EmbedColor } from '../helpers/EmbedHelper';
import RadioBot from '../RadioBot';
import Config from '../utils/Config';
import ICommand from '../utils/ICommand';

const FaqCommand: ICommand = {
    name: "faq",
    description: "Display the most frequently asked questions",
    run: (m: discord.Message, args: string[]): void => {
        let embed = new discord.MessageEmbed()
            .setColor(EmbedColor.Info)
            .setTitle("RadioBot FAQ:")
            .setFooter('RadioBot')
            .setURL(RadioBot.WebUrl)
            .setTimestamp();
    
        embed.addField("Help! I can't join RadioBot to my server.", "While RadioBot is pending on verification, it has a limit of 250 servers. When it gets verified, this limit will disappear. However, until then, if RadioBot is already in 250 servers, you will have to wait until somebody kicks it to join it to your server.");
        embed.addField("Help! I can't find RadioBot in any of my voice channels.", "If RadioBot is not in any of your voice channels, it must have been either disconnected or directly not been ever configured. To select the voice channel for RadioBot use r!channel [name or part of name], or the alias r!c.");
        embed.addField("Help! RadioBot is connected to the channel, but it's not playing audio.", "It is not common, but RadioBot could be connected to the voice channel but not playing audio. Most of the time, this is because there's nothing playing on the bot. You can check this with r!np. If it's the case, simply choose a song with r!song, or the alias r!s.");
        embed.addField("Help! I've chosen a song, but RadioBot is not playing it.", "Try disconnecting RadioBot from the voice channel from the red button of Discord, not our command (Right click on RadioBot > Disconnect), to restart the music. Most of the time this will fix the issue. However, if it persists, you can also try disconnecting the bot with r!dc and selecting the song again.");
        embed.addField("Help! I've chosen a song, RadioBot is not playing it and the above solution is not working.", "Check RadioBot permissions on the voice channel it is joining. This does not happen if you allow all permissions selected when joining the bot to you server and don't change per-channel permissions of RadioBot.");
        embed.addField("Help! RadioBot is not joining my voice channel.", "Check RadioBot permissions on the voice channel it is joining. This does not happen if you allow all permissions selected when joining the bot to you server and don't change per-channel permissions of RadioBot.");
        embed.addField("Help! RadioBot is not returning to its voice channel when being moved out.", "Check RadioBot permissions on the voice channel it is joining. This does not happen if you allow all permissions selected when joining the bot to you server and don't change per-channel permissions of RadioBot.");
        embed.addField("Help! RadioBot restarted the song it was playing.", "Most of the time this is caused by a bot restart done by developers. Probably, a new feature or fix has been implemented.");
        embed.addField("Help! Songs are playing one after the other and they are not repeating.", "This is because song queue is enabled in your server. Use r!queue or the alias r!q to enable/disable this feature.");
        embed.addField("Help! My problem is not listed here.", "These are the most common questions, so your problem may not be listed in this page. If it's the case, don't hesitate to use the multiple channels we have to receive your feedback. You can use the Reviews section in [Top.GG](https://top.gg/bot/778044858760953866), join our [support server](https://discord.gg/pxHzUVGfb5), send a [contact ticket](" + RadioBot.WebUrl + "), or use our embedded report system with r!report [message]. We will reply as soon as possible!");

        // Premium

        embed.addField("How much time lasts Premium?", "It will last one month since it was bought. If it's activated, one month later it will check if your Patreon subscription is still active. If it is, it will last for another month. If it's not, the Premium will end. If you cancel your Patreon subscription before activating the Premium, you will lose your Premium activation.");
        embed.addField("I have questions/problems with Premium or Patreon", "Please, use the Discord server channels, the contact form in [the web](" + RadioBot.WebUrl + ") or write a discord PM to <@" + Config.getInstance().getKeyOrDefault('StaffIds', [0])[0] + ">.");

        m.reply({ embeds: [embed]});
    }
};

export default FaqCommand;