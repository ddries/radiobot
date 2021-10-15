import discord from "discord.js";
import SongModel from "../db/models/SongModel";
import { Server } from "../managers/ServerManager";
import RadioBot from "../RadioBot";
import FunctionUtils from "../utils/FunctionUtils";

export default class EmbedHelper {
    public static generic(text: string, color: EmbedColor, title = ""): discord.MessageEmbed {
        return this._simple(text, color, title).setFooter(RadioBot.BotName).setTimestamp(Date.now());
    }

    public static OK(text: string): discord.MessageEmbed {
        return this._simple(text, EmbedColor.OK);
    }

    public static NOK(text: string): discord.MessageEmbed {
        return this._simple(text, EmbedColor.NOK);
    }

    public static Info(text: string): discord.MessageEmbed {
        return this._simple(text, EmbedColor.Info);
    }

    public static Premium(text: string): discord.MessageEmbed {
        return this._simple(text, EmbedColor.Premium);
    }

    private static _simple(text: string, color: EmbedColor, title: string = ""): discord.MessageEmbed {
        return new discord.MessageEmbed()
            .setDescription(text)
            .setTitle(title)
            .setColor(color);
    }

    public static songList(server: Server, pageNumber: number = 1): discord.MessageEmbed {
        let embed = new discord.MessageEmbed()
            .setColor(EmbedColor.Info)
            .setTitle(server.getGuild().name + ' song list (' + server.getSongs().length + '/' + server.getMaxSongs() + ')');

        if (server.getSongs().length <= RadioBot.SongsPerEmbed) {
            for (let i = 0; i < server.getSongs().length; i++) {
                embed.addField('Song ' + (i + 1), server.getSongAt(i).getName());
            }

            return embed;
        }

        const offset = RadioBot.SongsPerEmbed * (pageNumber - 1);
        const finalIndex = (offset + RadioBot.SongsPerEmbed > server.getSongs().length) ? server.getSongs().length : offset + RadioBot.SongsPerEmbed;

        for (let i = offset; i < finalIndex; i++) {
            embed.addField('Song ' + (i + 1), server.getSongAt(i).getName());
        }

        embed.setFooter('Page ' + pageNumber + '/' + Math.ceil(server.getSongs().length / RadioBot.SongsPerEmbed) + ' — ' + RadioBot.BotName);
        return embed;
    }

    public static singleSong(song: SongModel): discord.MessageEmbed {
        let embed = new discord.MessageEmbed()
            .setColor(EmbedColor.Info)
            .setTitle(song.getName())
            .setURL(song.getUrl())
            .setThumbnail('https://img.youtube.com/vi/' + song.getVideoId() + '/0.jpg')
            .setDescription("⌛ " + FunctionUtils.formatSecondsIntoTime(song.getLengthSeconds()))
            .setFooter("Click on the song title to open the Youtube video.");
        return embed;
    }
}

export enum EmbedColor {
    OK = "#32a852",
    NOK = "#eb4034",
    Info = "#fcba03",
    Premium = "#4287f5"
}