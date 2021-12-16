import Db from "../Db";

export default class PremiumDriver {

    public static async getAllPremiumUsers(): Promise<Array<string>> {
        const dbResult: any[] = await Db.getMySqlContext().queryGetResult('SELECT discord_userid FROM premium WHERE is_active = 1 AND finished = 0');
        let result: Array<string> = new Array<string>();
 
        for (let i = 0; i < dbResult.length; i++) {
            result.push(dbResult[i]["discord_userid"]);
        }

        return result;
    }

    public static setUserPremium(userId: string, active: boolean = true): void {
        Db.getMySqlContext().query('UPDATE premium SET is_active = ? WHERE discord_userid = ?', [ active ? 1 : 0, userId ]);
    }
    
}