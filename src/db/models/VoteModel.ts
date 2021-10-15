export default class VoteModel {
    private _userId: string = "";
    private _votes: number = -1;

    constructor(userId: string, votes: number) {
        this._userId = userId;
        this._votes = votes;
    }

    public getVotes(): number {
        return this._votes;
    }

    public getUserId(): string {
        return this._userId;
    }
}