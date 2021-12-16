import fetch from 'node-fetch';
import Logger from './Logger';

export default class PatreonApi {
    private static _url: string = "";
    private static logger: Logger = new Logger('radiobot-patreonapi');

    public static async getPledgeIdByDiscordUserId(userId: string): Promise<string> {
        let result: string = "";

        try {
            let _apiResult = await (await fetch(this._url + 'fetch_pledge_by_discord_id?u=' + userId)).json();
            return _apiResult.pledge_id;
        } catch (e) {
            this.logger.log('error on getPledgeIdByDiscordUserId: ' + e);
        }

        return result;
    }

    public static setUrl(url: string): void {
        this._url = url;
        this.logger.log('established patreon api url to ' + this._url);
    }
}