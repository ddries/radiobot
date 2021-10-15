import Db from "../Db";

export default class ChannelDriver {

    public static async getChannelByServerId(id: string): Promise<string> {
        const dbResult: any[] = await Db.getMySqlContext().queryGetResult('SELECT channelid FROM channel WHERE serverid = ?', [id]);

        if (dbResult.length <= 0) {
            return null;
        }

        return dbResult[0];
    }

    public static async getAllServersChannel(): Promise<Map<string, string>> {
        let result: Map<string, string> = new Map<string, string>();
        
        const dbResult: any[] = await Db.getMySqlContext().queryGetResult('SELECT channelid, serverid FROM channel');
        for (let i = 0; i < dbResult.length; i++) {
            const rawChannel = dbResult[i];
            const serverId = rawChannel['serverid'];
            const channelId = rawChannel['channelid'];

            result.set(serverId, channelId);
        }

        return result;
    }

    public static setServerChannelById(serverId: string, channelId: string): void {
        Db.getMySqlContext().query('INSERT INTO channel(serverid, channelid) VALUES (?, ?) ON DUPLICATE KEY UPDATE channelid = ?', [serverId, channelId, channelId]);
    }

}