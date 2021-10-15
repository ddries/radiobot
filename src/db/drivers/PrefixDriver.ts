import Db from "../Db";

export default class PrefixDriver {

    public static async getPrefixByServerId(id: string): Promise<string> {
        const dbResult: any[] = await Db.getMySqlContext().queryGetResult('SELECT prefix FROM prefixes WHERE serverid = ? LIMIT 1', [id]);

        if (dbResult.length <= 0) {
            return null;
        }

        return dbResult[0];
    }

    public static async getAllServerPrefixes(): Promise<Map<string, string>> {
        let result: Map<string, string> = new Map<string, string>();
        
        const dbResult: any[] = await Db.getMySqlContext().queryGetResult('SELECT serverid, prefix FROM prefixes');
        for (let i = 0; i < dbResult.length; i++) {
            const rawPrefix = dbResult[i];
            const serverId = rawPrefix['serverid'];
            const prefix = rawPrefix['prefix'];

            result.set(serverId, prefix);
        }

        return result;
    }

    public static setServerPrefixById(serverId: string, prefix: string): void {
        Db.getMySqlContext().query('INSERT INTO prefixes(serverid, prefix) VALUES (?, ?) ON DUPLICATE KEY UPDATE prefix = ?', [serverId, prefix, prefix]);
    }

}