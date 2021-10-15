import PlayingSongDriver from "../db/drivers/PlayingSongDriver";
import Logger from "../utils/Logger";

export default class PlayingSongManager {
    private static _instance: PlayingSongManager = null;
    private _logger: Logger = null;

    private _playingSongs: Map<string, number> = new Map<string, number>();

    public getServerPlayingSongById(id: string): number {
        if (this._playingSongs.has(id)) return this._playingSongs.get(id);
        else return -1;
    }

    public setServerPlayingSongById(serverId: string, playingSongId: number): void {
        this._playingSongs.set(serverId, playingSongId);
        PlayingSongDriver.setServerPlayingSongById(serverId, playingSongId);
    }

    private constructor() {
        this._logger = new Logger("radiobot-playingsongmanager");
    }

    public async init(): Promise<void> {
        this._playingSongs = await PlayingSongDriver.getAllServersPlayingSong();
        this._logger.log('loaded (' + this._playingSongs.size + ') playing songs');
    }

    public static getInstance(): PlayingSongManager {
        if (!this._instance) {
            this._instance = new PlayingSongManager();
        }

        return this._instance;
    }

}