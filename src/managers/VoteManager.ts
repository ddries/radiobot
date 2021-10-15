import VoteDriver from "../db/drivers/VoteDriver";
import VoteModel from "../db/models/VoteModel";
import Logger from "../utils/Logger";

export default class VoteManager {
    private static _instance: VoteManager = null;
    private _logger: Logger = null;

    private _votes: Map<string, number> = new Map<string, number>();

    private constructor() {
        this._logger = new Logger("radiobot-votemanager");
    }

    public getVotesByUserId(userId: string): number {
        if (!this._votes.has(userId)) return 0;
        return this._votes.get(userId);
    }

    public setVotesByUserId(userId: string, votes: number): void {
        this._votes.set(userId, votes);
        VoteDriver.setUserVotesById(userId, votes);
    }

    public incrementVotesByUserId(userId: string): void {
        if (!this._votes.has(userId))
            this._votes.set(userId, 0);

        this._votes.set(userId, this._votes.get(userId) + 1);
        VoteDriver.setUserVotesById(userId, this._votes.get(userId));
    }

    public async init(): Promise<void> {
        const allVotes: Array<VoteModel> = await VoteDriver.getAllVotes();

        for (let i = 0; i < allVotes.length; i++) {
            this._votes.set(allVotes[i].getUserId(), allVotes[i].getVotes());
            //this._logger.log('set votes of user ' + allVotes[i].getUserId() + ' to ' + allVotes[i].getVotes());
        }

        this._logger.log('loaded (' + allVotes.length + ') votes');
    }

    public static getInstance(): VoteManager {
        if (!this._instance) {
            this._instance = new VoteManager();
        }

        return this._instance;
    }

}