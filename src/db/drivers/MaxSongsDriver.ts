import Db from "../Db";
import VotePackModel from "../models/VotePackModel";

export default class VotePackDriver {

    public static async getMaxSongsByServerId(id: string): Promise<number> {
        const dbResult: any[] = await Db.getMySqlContext().queryGetResult('SELECT max_songs FROM server_maxsongs WHERE serverid = ?', [id]);

        if (dbResult.length <= 0) {
            return null;
        }

        return parseInt(dbResult[0]);
    }

    public static async getAllServerMaxSongs(): Promise<Map<string, number>> {
        let result: Map<string, number> = new Map<string, number>();
        
        const dbResult: any[] = await Db.getMySqlContext().queryGetResult('SELECT serverid, max_songs FROM server_maxsongs');
        for (let i = 0; i < dbResult.length; i++) {
            const rawMaxSongs = dbResult[i];
            const serverId = rawMaxSongs['serverid'];
            const maxSongs = parseInt(rawMaxSongs['max_songs']);

            result.set(serverId, maxSongs);
        }

        return result;
    }

    public static setServerMaxSongsById(serverId: string, maxSongs: number): void {
        Db.getMySqlContext().query('INSERT INTO server_maxsongs(serverid, max_songs) VALUES (?, ?) ON DUPLICATE KEY UPDATE max_songs = ?', [serverId, maxSongs, maxSongs]);
    }

}