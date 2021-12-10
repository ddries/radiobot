import fetch from 'node-fetch';
import fs from 'fs';
import FunctionUtils from './FunctionUtils';
import path from 'path';
import RadioBot from '../RadioBot';
import Logger from './Logger';

export default class WebApi {
    private static _url: string = "";
    private static logger: Logger = new Logger('radiobot-webapi');

    private static apiStatus: boolean = false;

    private static videosBeingDownloadedByVideoId = new Array<string>();

    public static getVideoInfo(videoId: string, fields: string[]): Promise<Map<string, string>> {
        return new Promise<Map<string, string>>(async resolve => {
            if (!this.apiStatus) resolve(null);
            
            let fieldsString = "";
            for (let i = 0; i < fields.length; i++) {
                fieldsString += fields[i]

                if (i < fields.length - 1)
                    fieldsString += ',';
            }

            try {
                let _apiResult = await (await fetch(this._url + 'info?&u=' + encodeURIComponent(videoId) + '&f=' + fieldsString)).json();
                let result: Map<string, string> = new Map<string, string>();
    
                for (const k in _apiResult) {
                    result.set(k, _apiResult[k]);
                }
    
                resolve(result);
            } catch (e) {
                resolve(null);
            }
        });
    }

    public static validateVideo(videoId: string): Promise<boolean> {
        return new Promise<boolean>(async resolve => {
            if (!this.apiStatus) resolve(false);

            let _res = await fetch(this._url + 'validate?u=' + encodeURIComponent(videoId));
            return resolve(_res.status == 200);
        });
    }

    public static downloadVideo(videoId: string): Promise<string> {
        return new Promise<string>(async (resolve, reject) => {
            if (!this.apiStatus) reject();

            const videoIdHashed: string = FunctionUtils.getMd5(videoId);
            const fileName: string = videoIdHashed + '.weba';

            this.logger.log('downloading video id ' + videoId);
            this.videosBeingDownloadedByVideoId.push(videoId);

            let _apiRequest = (await fetch(this.buildUrlForVideoId(videoId)));

            if (_apiRequest.status !== 200) {
                reject();
                return;
            }

            let _proc = _apiRequest.body.pipe(
                fs.createWriteStream(
                    path.join(RadioBot.CachePath, fileName),
                    {
                        flags: 'w+'
                    }
                )
            );

            _proc.once('error', error => {
                this.logger.log('[ERROR] Deleting temp cache file, error on downloading video Id ' + videoId + ': ' + error);
                fs.unlink(path.join(RadioBot.CachePath, fileName), err => { if (err) this.logger.log('[ERROR] Error deleting temp cache file video Id ' + videoId + ': ' + err); });
            });

            _proc.once('finish', () => {
                const _i = this.videosBeingDownloadedByVideoId.indexOf(videoId);
                if (_i !== -1) this.videosBeingDownloadedByVideoId.splice(_i, 1);
                
                if (_i !== -1) {
                    this.logger.log('dealloc videoId ' + videoId + ' from download block');
                } else {
                    this.logger.log('could not find videoId ' + videoId + ' in download block');
                }

                resolve(fileName);
            });
        });
    }

    public static buildUrlForVideoId(videoId: string): string {
        return this._url + 'audio?u=' + encodeURIComponent(videoId) + '&ver=v2';
    }

    public static buildLiveUrlForVideoId(videoId: string): string {
        return this._url + 'live?&u=' + encodeURIComponent(videoId);
    }

    public static async performHeartbeat(): Promise<boolean> {
        if (this._url.length <= 0) return false;
        const _result = await fetch(
            this._url,
            {
                headers: {
                    "Authorization": "002"
                }
            }
        );

        this.apiStatus = _result.status == 200;
        return this.apiStatus;
    }

    public static isVideoBeingDownloaded(videoId: string): boolean {
        return this.videosBeingDownloadedByVideoId.indexOf(videoId) !== -1;
    }

    public static getStatus(): boolean {
        return this.apiStatus;
    }

    public static setUrl(url: string): void {
        this._url = url;
        this.logger.log('established api url to ' + this._url);
    }
}