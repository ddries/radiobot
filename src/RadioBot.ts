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
        // await CadenceMemory.getInstance().init();

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

        await ServerManager.getInstance().init();

        this.logger.log('testing api functionality');
        WebApi.setUrl(Config.getInstance().getKeyOrDefault('ApiUrl', ''));
        const _apiStatus = await WebApi.performHeartbeat();
        this.logger.log('api status: ' + (_apiStatus ? 'working' : 'failing'));

        // const allSongs = SongManager.getInstance().getAllSongs();
        // const songRes = await Db.getMySqlContext().queryGetResult('SELECT id, video_id FROM song WHERE length = -1');
        // let i = 0
        // const _update_one_song = async () => {
        //     const song = songRes[i];
        //     const videoId = song['video_id'];
        //     const id = parseInt(song['id']);

        //     // if (song.getLengthSeconds() != -1) return;

        //     const result = await WebApi.getVideoInfo(videoId, ['lengthSeconds']);
        //     if (!result) {
        //         console.log('[ERROR] NO RESULT IN SONG ID ' + id);
        //         return;
        //     }

        //     Db.getMySqlContext().query('UPDATE song SET length = ? WHERE id = ?', [result.get('lengthSeconds'), id]);
        //     console.log('UPDATED SONG (' + id + ') LENGTH IS ' + result.get('lengthSeconds'));
        // };
        // let _i = setInterval(() => {
        //     _update_one_song();
        //     i++;
        //     if (i == songRes.length - 1) {
        //         clearInterval(_i);
        //         _i = null;
        //     }
        // }, 500);

        // return;

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
            }, 300_000); // 5 minutes
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