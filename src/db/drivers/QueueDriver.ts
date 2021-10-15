import Db from "../Db";

export default class QueueDriver {

    public static async getQueueByServerId(id: string): Promise<boolean> {
        const dbResult: any[] = await Db.getMySqlContext().queryGetResult('SELECT state FROM queue WHERE serverid = ?', [id]);

        if (dbResult.length <= 0) {
            return false;
        }

        return parseInt(dbResult[0]) >= 1;
    }

    public static async getAllServersQueue(): Promise<Map<string, boolean>> {
        let result: Map<string, boolean> = new Map<string, boolean>();
        
        const dbResult: any[] = await Db.getMySqlContext().queryGetResult('SELECT state, serverid FROM queue');
        for (let i = 0; i < dbResult.length; i++) {
            const rawQueue = dbResult[i];
            const serverId = rawQueue['serverid'];
            const queue = parseInt(rawQueue['state']) >= 1;

            result.set(serverId, queue);
        }

        return result;
    }

    public static setServerQueueById(serverId: string, state: boolean): void {
        Db.getMySqlContext().query('INSERT INTO queue(serverid, state) VALUES (?, ?) ON DUPLICATE KEY UPDATE state = ?', [serverId, state ? 1 : 0, state ? 1 : 0]);
    }

}