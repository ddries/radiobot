import discord from 'discord.js';

export default interface ICommand {
    name: string;
    aliases?: string[] | undefined;
    description?: string | undefined;
    adminOnly?: boolean | undefined;
    run: (m: discord.Message, args: string[]) => (void | Promise<void>);
}