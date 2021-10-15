import ChannelDriver from "../db/drivers/ChannelDriver";
import Logger from "../utils/Logger";

export default class RChannelManager {
    private static _instance: RChannelManager = null;
    private _logger: Logger = null;

    private _channels: Map<string, string> = new Map<string, string>();

    public getServerChannelById(id: string): string {
        if (this._channels.has(id)) return this._channels.get(id);
        else return null;
    }

    public setServerChannelById(serverId: string, channelId: string): void {
        this._channels.set(serverId, channelId);
        ChannelDriver.setServerChannelById(serverId, channelId);
    }

    private constructor() {
        this._logger = new Logger("radiobot-channelmanager");
    }

    public async init(): Promise<void> {
        this._channels = await ChannelDriver.getAllServersChannel();
        this._logger.log('loaded (' + this._channels.size + ') channels');
    }

    public static getInstance(): RChannelManager {
        if (!this._instance) {
            this._instance = new RChannelManager();
        }

        return this._instance;
    }

}