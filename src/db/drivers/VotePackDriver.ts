import Db from "../Db";
import VotePackModel from "../models/VotePackModel";

export default class VotePackDriver {

    public static async getVotePacksByUserId(id: number): Promise<Map<number, number>> {
        const dbResult: any[] = await Db.getMySqlContext().queryGetResult('SELECT pack FROM vote_packs WHERE userid = ?', [id]);
        let result: Map<number, number> = new Map<number, number>(); 

        if (dbResult.length <= 0) {
            return null;
        }

        for (let i = 0; i < dbResult.length; i++) {
            const rawPack = dbResult[i];
            const packId: number = parseInt(rawPack['pack']);

            if (result.has(packId)) result.set(packId, result.get(packId) + 1);
            else result.set(packId, 1);
        }

        return result;
    }

    public static async getAllVotePacks(): Promise<Map<string, Map<number, number>>> {
        let result: Map<string, Map<number, number>> = new Map<string, Map<number, number>>();
        
        const dbResult: any[] = await Db.getMySqlContext().queryGetResult('SELECT userid, pack FROM vote_packs');
        for (let i = 0; i < dbResult.length; i++) {
            const rawPack = dbResult[i];
            const userId = rawPack['userid'];
            const votePackId = parseInt(rawPack['pack']);

            if (result.has(userId)) {
                if (result.get(userId).has(votePackId)) result.get(userId).set(votePackId, result.get(userId).get(votePackId) + 1);
                else result.get(userId).set(votePackId, 1);
            } else {
                result.set(userId, new Map<number, number>([
                    [votePackId, 1]
                ]));
            }
        }

        return result;
    }

    public static removeUserVotePackById(userId: string, votePackId: number): void {
        Db.getMySqlContext().query('DELETE FROM vote_packs WHERE userId = ? AND pack = ? LIMIT 1', [userId, votePackId]);
    }

    public static addUserVotePackById(userId: string, votePackId: number): void {
        Db.getMySqlContext().query('INSERT INTO vote_packs(userid, pack) VALUES (?, ?)', [userId, votePackId]);
    }

}