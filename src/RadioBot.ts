import Config from './utils/Config';
import Db from './db/Db';
import RadiobotDiscord from './discord/RadiobotDiscord';
import Logger from './utils/Logger';
import SongManager from './managers/SongManager';
import VoteManager from './managers/VoteManager';
import VotePackManager from './managers/VotePackManager';
import MaxSongsManager from './managers/MaxSongsManager';
import PrefixManager from './managers/PrefixManager';
import ServerManager from './managers/ServerManager';
import QueueManager from './managers/QueueManager';
import ShuffleManager from './managers/ShuffleManager';
import RChannelManager from './managers/RChannelManager';
import PlayingSongManager from './managers/PlayingSongManager';
import WebApi from './utils/WebApi';
import HttpServer from './http/HttpServer';
import PremiumManager from './managers/PremiumManager';
import PatreonApi from './utils/PatreonApi';

export default class RadioBot {

    private static _instance: RadioBot = null;
    private logger: Logger = null;

    public static Debug: boolean = true;
    public static Version: string = "0.0.0";
    public static IsMainBot: boolean = true;
    public static WebUrl: string = "";

    public static BotName: string = "";
    public static DefaultPrefix: string = "";

    public static BaseDir: string = __dirname;
    public static BaseScript: string = __filename;
    public static CachePath: string = "";

    public static SongsPerEmbed: number = 0;

    private constructor() {
        this.logger = new Logger('radiobot-core');
    }

    public async init(): Promise<void> {
        this.logger.log('started radiobot preload');
        
        await Config.getInstance().init();

        RadioBot.Debug = Config.getInstance().getKeyOrDefault('Debug', true);
        RadioBot.Version = (RadioBot.Debug ? 'dev' : 'prod') + '-' + Config.getInstance().getKeyOrDefault('Version', '0.0.0');
        RadioBot.IsMainBot = Config.getInstance().getKeyOrDefault('IsMainBot', true);
        RadioBot.WebUrl = Config.getInstance().getKeyOrDefault('WebUrl', '');

        RadioBot.BotName = Config.getInstance().getKeyOrDefault('BotName', '');
        RadioBot.DefaultPrefix = Config.getInstance().getKeyOrDefault('BotDefaultPrefix', '');
        
        RadioBot.CachePath = RadioBot.Debug ? '../cache/' : Config.getInstance().getKeyOrDefault('CachePath', './');

        RadioBot.SongsPerEmbed = Config.getInstance().getKeyOrDefault('SongsPerEmbed', 10);

        this.logger.log('radiobot preload completed');

        this._sign();

        await Db.getInstance().init();

        await SongManager.getInstance().init();
        await VoteManager.getInstance().init();
        await VotePackManager.getInstance().init();
        await MaxSongsManager.getInstance().init();

        if (RadioBot.IsMainBot)
            await PrefixManager.getInstance().init();

        await QueueManager.getInstance().init();
        await ShuffleManager.getInstance().init();
        await RChannelManager.getInstance().init();
        await PlayingSongManager.getInstance().init();
        await PremiumManager.getInstance().init();

        await ServerManager.getInstance().init();

        this.logger.log('testing api functionality');
        WebApi.setUrl(Config.getInstance().getKeyOrDefault('ApiUrl', ''));
        const _apiStatus = await WebApi.performHeartbeat();
        this.logger.log('api status: ' + (_apiStatus ? 'working' : 'failing'));

        PatreonApi.setUrl(Config.getInstance().getKeyOrDefault('PatreonApiUrl', ''));

        this.logger.log('starting discord module radiobot ' + RadioBot.Version + ", debug " + RadioBot.Debug.toString());
        await RadiobotDiscord.getInstance().init();

        if (RadiobotDiscord.getInstance().Client.shard && RadiobotDiscord.getInstance().Client.shard.ids.includes(0)) {
            if (!RadioBot.Debug)
                RadiobotDiscord.getInstance().sendStatus("Radiobot logged in.");

            new HttpServer();

            setInterval(async () => {
                this.logger.log('testing api functionality');
                let a = await WebApi.performHeartbeat();
                this.logger.log('api status: ' + (a ? 'working' : 'failing'));
            }, 300_000);
        }
    }

    private _sign(): void {
        console.log();console.log();
        const _sing = `\u001b[33m
                            ___       __          __ 
            _________ _____/ (_)___  / /_  ____  / /_
           / ___/ __ \`/ __  / / __ \\/ __ \\/ __ \\/ __/
          / /  / /_/ / /_/ / / /_/ / /_/ / /_/ / /_  
         /_/   \\__,_/\\__,_/_/\\____/_.___/\\____/\\__/  
                                                     
            \u001b[0m`;

        console.log(_sing);
        console.log(".......... \u001b[32mVersion:\u001b[0m " + RadioBot.Version);
        console.log(".......... \u001b[32mEnvironment:\u001b[0m " + (RadioBot.Debug ? "Development" : "Production"));
        console.log(".......... \u001b[32mBoot date UTC:\u001b[0m " + (new Date().toUTCString()));
        console.log(".......... \u001b[32mBot name:\u001b[0m " + RadioBot.BotName);
        console.log(".......... \u001b[32mRunning main instance:\u001b[0m " + RadioBot.IsMainBot.toString());
        console.log(".......... \u001b[32mRunning on:\u001b[0m nodejs " + process.version);
        console.log(".......... \u001b[32mHost Architecture:\u001b[0m " + process.arch);
        console.log();console.log();
    }

    public static getInstance(): RadioBot {
        if (!this._instance) {
            this._instance = new RadioBot();
        }

        return this._instance;
    }

}

;(async () => {
    await RadioBot.getInstance().init();
})();