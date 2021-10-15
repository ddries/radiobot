import Db from "../Db";

export default class ShuffleDriver {

    public static async getShuffleByServerId(id: string): Promise<boolean> {
        const dbResult: any[] = await Db.getMySqlContext().queryGetResult('SELECT state FROM shuffle WHERE serverid = ?', [id]);

        if (dbResult.length <= 0) {
            return false;
        }

        return parseInt(dbResult[0]) >= 1;
    }

    public static async getAllServersShuffle(): Promise<Map<string, boolean>> {
        let result: Map<string, boolean> = new Map<string, boolean>();
        
        const dbResult: any[] = await Db.getMySqlContext().queryGetResult('SELECT state, serverid FROM shuffle');
        for (let i = 0; i < dbResult.length; i++) {
            const rawShuffle = dbResult[i];
            const serverId = rawShuffle['serverid'];
            const shuffle = parseInt(rawShuffle['state']) >= 1;

            result.set(serverId, shuffle);
        }

        return result;
    }

    public static setServerShuffleById(serverId: string, state: boolean): void {
        Db.getMySqlContext().query('INSERT INTO shuffle(serverid, state) VALUES (?, ?) ON DUPLICATE KEY UPDATE state = ?', [serverId, state ? 1 : 0, state ? 1 : 0]);
    }

}