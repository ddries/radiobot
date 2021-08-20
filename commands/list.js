
const { MessageActionRow, MessageButton } = require('discord.js');
var core = require('./../core/core.js');

module.exports = {
    name: "list",
    description: "Show the added songs in your server.",
    execute: async (m, args, discord, client) => {
        // m.reply({content:'Sorry! This command is currenty unavailable. If you need support please join us in the support server: https://discord.gg/cMcVSeg5m3'});
        if (!core.getServerSongs(m.guild.id) || core.getServerSongs(m.guild.id).length <= 0) {
            core.discord.notify(core.discord.NotifyType.Error, m.channel, {
                description: "There aren't any songs added in " + m.guild.name + " yet! Try adding some with **" + core.getServerPrefix(m.guild.id) + "add**"
            });
            return;
        }
        
        if (core.getServerSongs(m.guild.id).length > 25) {
            let page = 1;

            const btnRow = new MessageActionRow()
                .addComponents(
                    [
                        new MessageButton()
                            .setStyle('SECONDARY')
                            .setLabel('Previous')
                            .setCustomId('list-prev'),
                        new MessageButton()
                            .setStyle('SECONDARY')
                            .setLabel('Next')
                            .setCustomId('list-next')
                    ]
                );

            const emb = core.buildSongList(m.guild, discord, page);

            const reply = await m.channel.send({embeds: [emb], components: [btnRow]});

            const filter = (b) => b.user.id === m.author.id;
            const col = reply.createMessageComponentCollector({
                filter,
                time: 30 * 1000
            });

            col.on('collect', (int) => {
                int.deferUpdate().then(async () => {
                    switch (int.customId) {
                        case 'list-prev':
                            page--;
                            if (page < 1)
                                page = Math.ceil(core.getServerSongs(m.guild.id).length/core.SONGS_PER_EMBED);
                            break;
                        case 'list-next':
                            page++;
                            if (page > Math.ceil(core.getServerSongs(m.guild.id).length/core.SONGS_PER_EMBED))
                                page = 1;
                            break;
                    }
    
                    await int.editReply({
                        embeds: [core.buildSongList(m.guild, discord, page)]
                    });
                }).catch(e => {
                    core.logs.log("Could not send interaction list: " + e, 'ERROR', core.logs.LogFile.ERROR_LOG);
                });
            });

            // core.sendSongListAwaitReaction(m.author, m.channel, m.guild, discord, (r, msg) => {
            //     if (r.emoji.id == '825081129278111765') {
            //         page++;
            //         if (page > Math.ceil(core.getServerSongs(m.guild.id).length/core.SONGS_PER_EMBED))
            //             page = 1;
            //     } else if (r.emoji.id == '825081080532172851') {
            //         page--;
            //         if (page < 1)
            //             page = Math.ceil(core.getServerSongs(m.guild.id).length/core.SONGS_PER_EMBED);
            //     }
                
            //     msg.edit(core.buildSongList(m.guild, discord, page));
            // }, client, page);
        } else {
            m.channel.send({ embeds: [core.buildSongList(m.guild, discord)]});
        }
    }
};