import QueueDriver from "../db/drivers/QueueDriver";
import Logger from "../utils/Logger";

export default class QueueManager {
    private static _instance: QueueManager = null;
    private _logger: Logger = null;

    private _queue: Map<string, boolean> = new Map<string, boolean>();

    public getServerQueueById(id: string): boolean | null {
        if (this._queue.has(id)) return this._queue.get(id);
        else return null;
    }

    public setServerQueueById(serverId: string, state: boolean): void {
        this._queue.set(serverId, state);
        QueueDriver.setServerQueueById(serverId, state);
    }

    private constructor() {
        this._logger = new Logger("radiobot-queuemanager");
    }

    public async init(): Promise<void> {
        this._queue = await QueueDriver.getAllServersQueue();
        this._logger.log('loaded (' + this._queue.size + ') queue states');
    }

    public static getInstance(): QueueManager {
        if (!this._instance) {
            this._instance = new QueueManager();
        }

        return this._instance;
    }

}