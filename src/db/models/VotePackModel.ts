export default class VotePackModel {
    private _userId: string = "";
    private _votePackId: number = -1;

    constructor(userId: string, votePackId: number) {
        this._userId = userId;
        this._votePackId = votePackId;
    }

    public getVotePackId(): number {
        return this._votePackId;
    }

    public getUserId(): string {
        return this._userId;
    }
}