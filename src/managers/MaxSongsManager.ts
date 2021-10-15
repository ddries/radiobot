import MaxSongsDriver from "../db/drivers/MaxSongsDriver";
import Logger from "../utils/Logger";

export default class MaxSongsManager {
    private static _instance: MaxSongsManager = null;
    private _logger: Logger = null;

    private _maxSongs: Map<string, number> = new Map<string, number>();

    public getServerMaxSongsById(id: string): number {
        if (this._maxSongs.has(id)) return this._maxSongs.get(id);
        else return null;
    }

    public setServerMaxSongs(serverId: string, maxSongs: number, updateBd: boolean = true): void {
        if (!this.getServerMaxSongsById(serverId)) return;
        this._maxSongs.set(serverId, maxSongs);
        
        MaxSongsDriver.setServerMaxSongsById(serverId, maxSongs);
    }

    public incrementServerMaxSongs(serverId: string): void {
        if (!this.getServerMaxSongsById(serverId)) return;
        this.setServerMaxSongs(serverId, this.getServerMaxSongsById(serverId) + 1);
    }

    private constructor() {
        this._logger = new Logger("radiobot-maxsongsmanager");
    }

    public async init(): Promise<void> {
        this._maxSongs = await MaxSongsDriver.getAllServerMaxSongs();
        this._logger.log('loaded (' + this._maxSongs.size + ') max songs (not default)');
    }

    public static getInstance(): MaxSongsManager {
        if (!this._instance) {
            this._instance = new MaxSongsManager();
        }

        return this._instance;
    }

}