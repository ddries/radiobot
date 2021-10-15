import VoteDriver from "../db/drivers/VoteDriver";
import VotePackDriver from "../db/drivers/VotePackDriver";
import VoteModel from "../db/models/VoteModel";
import VotePackModel from "../db/models/VotePackModel";
import Logger from "../utils/Logger";

export default class VotePackManager {
    private static _instance: VotePackManager = null;
    private _logger: Logger = null;

    private _votePacks: Map<string, Map<number, number>> = new Map<string, Map<number, number>>();

    public getAllVotePacksByUserId(id: string): Map<number, number> {
        if (this._votePacks.has(id)) return this._votePacks.get(id);
        else return null;
    }

    public getVotePacksByUserId(id: string, votePackId: number): number {
        if (!this._votePacks.has(id)) return 0;
        if (!this._votePacks.get(id).has(votePackId)) return 0;
        return this._votePacks.get(id).get(votePackId);
    }

    public hasVotePack(userId: string, votePackId: number): boolean {
        return this.getVotePacksByUserId(userId, votePackId) > 0;
    }

    public removeVotePack(userId: string, votePackId: number): void {
        if (!this.hasVotePack(userId, votePackId)) return;
        this._votePacks.get(userId).set(votePackId, this._votePacks.get(userId).get(votePackId) - 1);

        VotePackDriver.removeUserVotePackById(userId, votePackId);
    }

    public addVotePack(userId: string, votePackId: number): void {
        if (!this._votePacks.has(userId))
            this._votePacks.set(userId, new Map<number, number>());

        if (!this._votePacks.get(userId).has(votePackId))
            this._votePacks.get(userId).set(votePackId, 1);
        else
            this._votePacks.get(userId).set(votePackId, this._votePacks.get(userId).get(votePackId) + 1);

        VotePackDriver.addUserVotePackById(userId, votePackId);
    }

    private constructor() {
        this._logger = new Logger("radiobot-votepackmanager");
    }

    public async init(): Promise<void> {
        this._votePacks = await VotePackDriver.getAllVotePacks();
        this._logger.log('loaded (' + this._votePacks.size + ') vote packs');
    }

    public static getInstance(): VotePackManager {
        if (!this._instance) {
            this._instance = new VotePackManager();
        }

        return this._instance;
    }

}

export enum VotePackType {
    LongerSong = 0,
    SongSlot = 1,
    Queue = 2,
    Shuffle = 3,
    AnyLengthLiveVideo = 4
}