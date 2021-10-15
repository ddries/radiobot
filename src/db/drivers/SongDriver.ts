import Db from "../Db";
import SongModel from "../models/SongModel";

export default class SongDriver {

    public static async createSong(name: string, url: string, videoId: string, serverId: string, lengthSeconds: number): Promise<number> {
        const id: number = await Db.getMySqlContext().queryGetInsertedId('INSERT INTO song(name, url, video_id, serverid, length) VALUES(?, ?, ?, ?, ?)', [name, url, videoId, serverId, lengthSeconds]);
        return id;
    }

    public static async getSongById(id: number): Promise<SongModel> {
        const dbResult: any[] = await Db.getMySqlContext().queryGetResult('SELECT * FROM song WHERE id = ? LIMIT 1', [id]);

        if (dbResult.length <= 0) {
            return null;
        }

        const rawSong = dbResult[0];
        const name = rawSong["name"];
        const url = rawSong["url"];
        const videoId = rawSong["video_id"];
        const serverId = rawSong["serverid"];
        const length = parseInt(rawSong["length"]);

        return new SongModel(id, name, url, videoId, serverId, length);
    }

    public static async getAllSongs(): Promise<Array<SongModel>> {
        let result: Array<SongModel> = new Array<SongModel>();

        const dbResult: any[] = await Db.getMySqlContext().queryGetResult('SELECT * FROM song');
        for (let i = 0; i < dbResult.length; i++) {
            const rawSong = dbResult[i];
            const id = parseInt(rawSong["id"]);
            const name = rawSong["name"];
            const url = rawSong["url"];
            const videoId = rawSong["video_id"];
            const serverId = rawSong["serverid"];
            const length = parseInt(rawSong["length"]);

            result.push(new SongModel(id, name, url, videoId, serverId, length));
        }

        return result;
    }

    public static removeSongById(songId: number): void {
        Db.getMySqlContext().query('DELETE FROM song WHERE id = ? LIMIT 1', [songId]);
    }

    public static editSongNameById(songId: number, songName: string): void {
        Db.getMySqlContext().query('UPDATE song SET name = ? WHERE id = ?', [songName, songId]);
    }

    public static clearAllServerSongs(serverId: string): void {
        Db.getMySqlContext().query('DELETE FROM song WHERE serverid = ?', [serverId]);
    }

}