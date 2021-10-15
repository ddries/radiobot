import ShuffleDriver from "../db/drivers/ShuffleDriver";
import Logger from "../utils/Logger";

export default class ShuffleManager {
    private static _instance: ShuffleManager = null;
    private _logger: Logger = null;

    private _shuffle: Map<string, boolean> = new Map<string, boolean>();

    public getServerShuffleById(id: string): boolean {
        if (this._shuffle.has(id)) return this._shuffle.get(id);
        else return null;
    }

    public setServerShuffleById(serverId: string, state: boolean): void {
        this._shuffle.set(serverId, state);
        ShuffleDriver.setServerShuffleById(serverId, state);
    }

    private constructor() {
        this._logger = new Logger("radiobot-shufflemanager");
    }

    public async init(): Promise<void> {
        this._shuffle = await ShuffleDriver.getAllServersShuffle();
        this._logger.log('loaded (' + this._shuffle.size + ') shuffle states');
    }

    public static getInstance(): ShuffleManager {
        if (!this._instance) {
            this._instance = new ShuffleManager();
        }

        return this._instance;
    }

}