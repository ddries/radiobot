import ICommand from "../utils/ICommand";
import discord from 'discord.js';
import ServerManager, { ServerState } from "../managers/ServerManager";
import EmbedHelper from "../helpers/EmbedHelper";
import RadioBot from "../RadioBot";

const ListCommand: ICommand = {
    name: "list",
    description: "Show all songs in your server.",
    run: async (m: discord.Message, args: string[]): Promise<void> => {
        const server = ServerManager.getInstance().getServerById(m.guildId);
        if (!server) return;

        if (!server.getSongs() || server.getSongs().length <= 0) {
            m.reply({ embeds: [ EmbedHelper.NOK("There aren't any songs yet!\nUse `" + server.getPrefix() + "add`.") ]});
            return;
        }

        if (server.getSongs().length <= RadioBot.SongsPerEmbed) {
            m.reply({ embeds: [ EmbedHelper.songList(server) ]});
            return;
        }

        if (args.length > 0) {
            const givenPage = parseInt(args[0]);
            
        }

        let currentPage = 1;
        const buttonRow = new discord.MessageActionRow().addComponents(
            [
                new discord.MessageButton()
                    .setStyle('SECONDARY')
                    .setLabel('Previous')
                    .setCustomId('list-previous'),

                new discord.MessageButton()
                    .setStyle('SECONDARY')
                    .setLabel('Next')
                    .setCustomId('list-next')
            ]
        );

        const embed = EmbedHelper.songList(server, currentPage);
        const replyMessage = await m.channel.send({ embeds: [ embed ], components: [ buttonRow ]});
        const interactionFilter = (b) => b.user.id === m.author.id;
        const componentCollector = replyMessage.createMessageComponentCollector({
            filter: interactionFilter,
            time: 30 * 1000
        });

        componentCollector.on('collect', (interaction: discord.MessageComponentInteraction) => {
            interaction.deferUpdate().then(async () => {
                switch(interaction.customId) {
                    case 'list-previous':
                        currentPage--;
                        if (currentPage < 1)
                            currentPage = Math.ceil(server.getSongs().length / RadioBot.SongsPerEmbed);
                        break;
                    case 'list-next':
                        currentPage++;
                        if (currentPage > Math.ceil(server.getSongs().length / RadioBot.SongsPerEmbed))
                            currentPage = 1;
                        break;
                }

                await interaction.editReply({
                    embeds: [ EmbedHelper.songList(server, currentPage) ]
                });
            }).catch(e => { console.error(e); });
        });
    }
};

export default ListCommand;
