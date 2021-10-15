import SongDriver from "../db/drivers/SongDriver";
import SongModel from "../db/models/SongModel";
import Logger from "../utils/Logger";
import FunctionUtils from '../utils/FunctionUtils';

import fs from 'fs';
import path from 'path';
import RadioBot from "../RadioBot";

export default class SongManager {
    private static _instance: SongManager = null;
    private _logger: Logger = null;

    private _songsById: Map<number, SongModel> = new Map<number, SongModel>();
    private _songsByVideoId: Map<string, SongModel> = new Map<string, SongModel>();

    private _songsByServerId: Map<string, Array<SongModel>> = new Map<string, Array<SongModel>>();
    private _songs: Array<SongModel> = new Array<SongModel>();

    private constructor() {
        this._logger = new Logger("radiobot-songmanager");
    }

    public async createSong(name: string, url: string, videoId: string, serverId: string, lengthSeconds: number): Promise<SongModel> {
        const songId = await SongDriver.createSong(name, url, videoId, serverId, lengthSeconds);
        const song: SongModel = new SongModel(songId, name, url, videoId, serverId, lengthSeconds);

        this._songs.push(song);
        this._songsById.set(songId, song);
        if (!this._songsByServerId.has(serverId))
            this._songsByServerId.set(serverId, []);

        this._songsByServerId.get(serverId).push(song);
        this._songsByVideoId.set(videoId, song);

        return song;
    }

    public getSongById(id: number): SongModel {
        if (this._songsById.has(id)) return this._songsById.get(id);
        else return null;
    }

    public getAllSongs(): Array<SongModel> {
        return Array.from(this._songs.values());
    }

    public doesCacheEntryExist(song: SongModel): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            fs.access(path.join(RadioBot.CachePath, FunctionUtils.getMd5(song.getVideoId()) + ".weba"), fs.constants.R_OK, (err) => {
                resolve(!err);
            });
        });
    }

    public deleteCacheEntrySync(song: SongModel): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                fs.unlinkSync(path.join(RadioBot.CachePath, FunctionUtils.getMd5(song.getVideoId()) + ".weba"));
                resolve();
            } catch (e) {
                this._logger.log('tried to delete cache entry videoId ' + song.getVideoId() + ' but was busy, running again in 500ms');
                (new Promise<void>(res =>  setTimeout(res, 500))).then(() => { this.deleteCacheEntrySync(song); });
            }
        });
    }

    public clearAllServerSongs(serverId: string): void {
        if (!this._songsByServerId.has(serverId)) return;
        const songs = this._songsByServerId.get(serverId);

        for (const song of songs) {
            this._songsByVideoId.delete(song.getVideoId());
            this._songsById.delete(song.getId());

            const _i = this._songs.indexOf(song);
            if (_i !== -1) this._songs.splice(_i, 1);
        }

        this._songsByServerId.set(serverId, []);

        SongDriver.clearAllServerSongs(serverId);
    }

    public removeSong(song: SongModel): void {
        let _i = this._songs.indexOf(song);
        if (_i !== -1) this._songs.splice(_i, 1);

        this._songsById.delete(song.getId());
        this._songsByVideoId.delete(song.getVideoId());

        _i = this._songsByServerId.get(song.getServerId())?.indexOf(song);
        if (_i !== -1) this._songsByServerId.get(song.getServerId()).splice(_i, 1);

        SongDriver.removeSongById(song.getId());
    }

    public editSongName(song: SongModel, newName: string): void {
        song.setName(newName);
        SongDriver.editSongNameById(song.getId(), song.getName());
    }

    public async init(): Promise<void> {
        this._songs = await SongDriver.getAllSongs();

        for (let i = 0; i < this._songs.length; i++) {
            const song = this._songs[i];

            this._songsById.set(song.getId(), song);
            this._songsByVideoId.set(song.getVideoId(), song);
            
            if (this._songsByServerId.has(song.getServerId())) {
                this._songsByServerId.get(song.getServerId()).push(song);
            } else {
                this._songsByServerId.set(song.getServerId(), [song]);
            }
        }

        this._logger.log("loaded (" + this._songs.length + ") songs into memory.");
    }

    public static getInstance(): SongManager {
        if (!this._instance) {
            this._instance = new SongManager();
        }

        return this._instance;
    }
}