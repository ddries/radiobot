import Db from "../Db";

export default class PlayingSongDriver {

    public static async getPlayingSongByServerId(id: string): Promise<number> {
        const dbResult: any[] = await Db.getMySqlContext().queryGetResult('SELECT song_id FROM current_playing WHERE serverid = ?', [id]);

        if (dbResult.length <= 0) {
            return null;
        }

        return parseInt(dbResult[0]);
    }

    public static async getAllServersPlayingSong(): Promise<Map<string, number>> {
        let result: Map<string, number> = new Map<string, number>();
        
        const dbResult: any[] = await Db.getMySqlContext().queryGetResult('SELECT song_id, serverid FROM current_playing');
        for (let i = 0; i < dbResult.length; i++) {
            const rawPlayingSong = dbResult[i];
            const serverId = rawPlayingSong['serverid'];
            const songId = rawPlayingSong['song_id'];

            result.set(serverId, songId);
        }

        return result;
    }

    public static setServerPlayingSongById(serverId: string, songId: number): void {
        Db.getMySqlContext().query('INSERT INTO current_playing(serverid, song_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE song_id = ?', [serverId, songId, songId]);
    }

}