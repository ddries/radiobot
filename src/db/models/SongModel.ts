export default class SongModel {
    private _id: number = -1;
    private _name: string = "";
    private _url: string = "";
    private _videoId: string = "";
    private _serverId: string = "";
    private _lengthSeconds: number = -1;

    constructor(id: number, name: string, url: string, videoId: string, serverId: string, lengthSeconds: number) {
        this._id = id;
        this._name = name;
        this._url =url;
        this._videoId = videoId;
        this._serverId = serverId;
        this._lengthSeconds = lengthSeconds;
    }

    public getId(): number {
        return this._id;
    }

    public getName(): string {
        return this._name;
    }

    public setName(name: string): void {
        this._name = name;
    }

    public getUrl(): string {
        return this._url;
    }

    public getVideoId(): string {
        return this._videoId;
    }

    public getServerId(): string {
        return this._serverId;
    }

    public getLengthSeconds(): number {
        return this._lengthSeconds;
    }

    public isLiveVideo(): boolean {
        return this._lengthSeconds === 0;
    }
}