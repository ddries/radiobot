import discord from 'discord.js';
import RadioBot from '../RadioBot';
import ICommand from '../utils/ICommand';

const InviteCommand: ICommand = {
    name: "invite",
    description: "Display the invite link for the bot",
    run: (m: discord.Message, args: string[]): void => {
        m.reply("here's the link for RadioBot: " + RadioBot.WebUrl + "join");
    }
};

export default InviteCommand;