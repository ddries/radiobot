import discord from "discord.js";

export default class InteractionHelper {
    public static awaitConfirmation(message: discord.Message, userId: string): Promise<boolean> {
        return new Promise<boolean>(async resolve => {
            const confirmationReaction = await message.react('✅');
            const collector = message.createReactionCollector({ filter: (b, u) => b.emoji.name == '✅' && u.id == userId, time: 30_000, max: 1 });

            collector.on('collect', _ => resolve(true));
            
            collector.on('end', _ => {
                confirmationReaction?.remove();
                resolve(false);
            });

            collector.on('dispose', _ => {
                confirmationReaction?.remove();
                resolve(false);
            });
        });
    }
}