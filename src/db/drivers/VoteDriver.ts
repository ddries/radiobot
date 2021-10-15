import Db from "../Db";
import VoteModel from "../models/VoteModel";

export default class VoteDriver {

    public static async getVotesByUserId(id: number): Promise<number> {
        const dbResult: any[] = await Db.getMySqlContext().queryGetResult('SELECT votes FROM votes WHERE userid = ? LIMIT 1', [id]);

        if (dbResult.length <= 0) {
            return null;
        }

        return parseInt(dbResult[0]);
    }

    public static async getAllVotes(): Promise<Array<VoteModel>> {
        let result: Array<VoteModel> = new Array<VoteModel>();
        
        const dbResult: any[] = await Db.getMySqlContext().queryGetResult('SELECT * FROM votes');
        for (let i = 0; i < dbResult.length; i++) {
            const rawVote = dbResult[i];
            const userId = rawVote['userid'];
            const votes = parseInt(rawVote['votes']);

            result.push(new VoteModel(userId, votes));
        }

        return result;
    }

    public static setUserVotesById(userId: string, votes: number): void {
        Db.getMySqlContext().query('INSERT INTO votes(userid, votes) VALUES(?, ?) ON DUPLICATE KEY UPDATE votes = ?', [userId, votes, votes]);
    }

}