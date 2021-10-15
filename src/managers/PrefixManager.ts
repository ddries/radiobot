import PrefixDriver from "../db/drivers/PrefixDriver";
import RadioBot from "../RadioBot";
import Logger from "../utils/Logger";

export default class PrefixManager {
    private static _instance: PrefixManager = null;
    private _logger: Logger = null;

    private _prefixes: Map<string, string> = new Map<string, string>();

    private constructor() {
        this._logger = new Logger("radiobot-prefixmanager");
    }

    public setPrefixByServerId(serverId: string, prefix: string): void {
        this._prefixes.set(serverId, prefix);
        PrefixDriver.setServerPrefixById(serverId, prefix);
    }

    public getPrefixByServerId(id: string): string {
        if (!this._prefixes.has(id)) return RadioBot.DefaultPrefix;
        else return this._prefixes.get(id);
    }

    public async init(): Promise<void> {
        const allPrefixes: Map<string, string> = await PrefixDriver.getAllServerPrefixes();

        for (let [ serverId, prefix ] of allPrefixes) {
            this._prefixes.set(serverId, prefix);
        }

        this._logger.log('loaded (' + allPrefixes.size + ') prefixes');
    }

    public static getInstance(): PrefixManager {
        if (!this._instance) {
            this._instance = new PrefixManager();
        }

        return this._instance;
    }

}