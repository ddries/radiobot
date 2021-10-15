import fs from 'fs';
import path from 'path';

import Radiobot from '../RadioBot';
import Logger from './Logger';

export default class Config {

    private static _instance: Config = null;
    private logger: Logger = null;

    private _configFilename: string = "radiobot.json";
    private _config: { [key: string]: any } = null;

    public getKeyOrDefault<T>(key: string, def: T): T {
        if (this._config[key] == null) return def;
        return this._config[key];
    }

    private constructor() {
        this.logger = new Logger("radiobot-config");
    }

    public async init(): Promise<void> {
        try {
            const rawConfig: string = fs.readFileSync(path.join(Radiobot.BaseDir, this._configFilename), 'utf-8');
            this._config = JSON.parse(rawConfig);
        } catch (e) {
            this.logger.log("could not read config file " + e);
            process.exit(1);
        }
    }

    public static getInstance(): Config {
        if (!this._instance) {
            this._instance = new Config();
        }

        return this._instance;
    }
}