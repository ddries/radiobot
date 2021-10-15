import Logger from "../utils/Logger";
import discord, { GuildChannel } from 'discord.js';
import * as Voice from '@discordjs/voice';
import RadioBot from "../RadioBot";
import SongModel from "../db/models/SongModel";
import SongManager from "./SongManager";
import PrefixManager from "./PrefixManager";
import MaxSongsManager from "./MaxSongsManager";
import QueueManager from "./QueueManager";
import ShuffleManager from "./ShuffleManager";
import RChannelManager from "./RChannelManager";
import PlayingSongManager from "./PlayingSongManager";
import WebApi from "../utils/WebApi";
import FunctionUtils from "../utils/FunctionUtils";
import path from 'path';
import RadiobotDiscord from "../discord/RadiobotDiscord";

export default class ServerManager {
    private static _instance: ServerManager = null;
    public logger: Logger = null;

    private _servers: Map<string, Server> = new Map<string, Server>();

    private constructor() {
        this.logger = new Logger('radiobot-servermanager');
    }

    public getServerById(id: string): Server {
        if (!this._servers.has(id)) return null;
        else return this._servers.get(id);
    }

    public getAllServers(): Array<Server> {
        return Array.from(this._servers.values());
    }

    public createNew(guild: discord.Guild): void {
        const server = new Server(guild.id);
        this._servers.set(server.getId(), server);
    }

    public async init(): Promise<void> {
        const _songs: Array<SongModel> = SongManager.getInstance().getAllSongs();
        for (let i = 0; i < _songs.length; i++) {
            const _song = _songs[i];
            const _serverId = _song.getServerId();

            if (!this._servers.has(_serverId)) {
                const _server = new Server(_serverId);

                _server.setPrefix(PrefixManager.getInstance().getPrefixByServerId(_serverId), false);
                _server.setMaxSongs(MaxSongsManager.getInstance().getServerMaxSongsById(_serverId), false);

                const queueState = QueueManager.getInstance().getServerQueueById(_serverId);
                const shuffleState = ShuffleManager.getInstance().getServerShuffleById(_serverId);

                if (queueState !== null)
                    _server.setQueue(queueState, false);

                if (shuffleState !== null)
                    _server.setShuffle(shuffleState, false);

                _server.setChannelId(RChannelManager.getInstance().getServerChannelById(_serverId), false);

                const _playingSong = PlayingSongManager.getInstance().getServerPlayingSongById(_serverId);

                if (_playingSong > 0) {
                    _server.setPlayingSongId(_playingSong, false);
                    _server.setState(ServerState.Playing);
                } else {
                    _server.setState(ServerState.Disconnected);
                }

                _server.addSong(_song);

                this._servers.set(_serverId, _server);
            } else {
                this._servers.get(_serverId).addSong(_song);
            }
        }
    }

    public static getInstance(): ServerManager {
        if (!this._instance) {
            this._instance = new ServerManager();
        }

        return this._instance;
    }
}

export class Server {
    private readonly _id: string = "";
    private readonly logger: Logger = ServerManager.getInstance().logger;

    private _guild: discord.Guild = null;
    private _channelId: string = "";
    private _playingSongId: number = -1;
    private _prefix: string = RadioBot.DefaultPrefix;
    private _state: ServerState = ServerState.Idle;
    private _queueState: boolean = false;
    private _hasQueueAvailable: boolean = false;
    private _shuffleState: boolean = false;
    private _hasShuffleAvailable: boolean = false;
    private _maxSongs: number = 10;

    private _voiceSub: Voice.PlayerSubscription = null;
    private _playLocked: boolean = false;

    private _songs: Array<SongModel> = new Array<SongModel>();

    constructor(id: string) {
        this._id = id;
    }

    public getId(): string {
        return this._id;
    }

    public addSong(song: SongModel): void {
        this._songs.push(song);
    }

    public removeSong(song: SongModel, notifyUpdate: boolean = true): boolean {
        const _i: number = this._songs.indexOf(song);
        if (_i === -1) return false;

        this._songs.splice(_i, 1);

        if (notifyUpdate)
            SongManager.getInstance().removeSong(song);

        return true;
    }

    public clearSongs(): void {
        this._songs.length = 0;
        SongManager.getInstance().clearAllServerSongs(this.getId());
    }

    public getSongs(): Array<SongModel> {
        return this._songs;
    }

    public getSongAt(index: number): SongModel {
        if (index >= this._songs.length) return null;
        else return this._songs[index];
    }

    public setGuild(guild: discord.Guild): void {
        this._guild = guild;
    }

    public getGuild(): discord.Guild {
        return this._guild;
    }

    public setChannelId(channelId: string, notifyUpdate: boolean = true): void {
        this._channelId = channelId;

        if (notifyUpdate)
            RChannelManager.getInstance().setServerChannelById(this.getId(), channelId);
    }

    public getChannelId(): string {
        return this._channelId;
    }

    public setPlayingSongId(songId: number, notifyUpdate: boolean = true): void {
        this._playingSongId = songId;

        if (notifyUpdate)
            PlayingSongManager.getInstance().setServerPlayingSongById(this.getId(), songId);
    }

    public getPlayingSongId(): number {
        return this._playingSongId;
    }

    public getPlayingSong(): SongModel {
        return SongManager.getInstance().getSongById(this.getPlayingSongId());
    }

    public setPrefix(prefix: string, notifyUpdate: boolean = true): void {
        this._prefix = prefix;

        if (notifyUpdate) {
            PrefixManager.getInstance().setPrefixByServerId(this.getId(), prefix);
        }
    }

    public getPrefix(): string {
        return this._prefix;
    }

    public setState(state: ServerState): void {
        this._state = state;
    }

    public getState(): ServerState {
        return this._state;
    }

    public setQueue(state: boolean, notifyUpdate: boolean = true): void {
        this._queueState = state;
        if (!this._hasQueueAvailable) this._hasQueueAvailable = true;

        if (notifyUpdate)
            QueueManager.getInstance().setServerQueueById(this.getId(), state);
    }

    public isQueue(): boolean {
        return this._queueState;
    }

    public isQueueAvailable(): boolean {
        return this._hasQueueAvailable;
    }

    public setShuffle(state: boolean, notifyUpdate: boolean = true): void {
        this._shuffleState = state;
        if (!this._hasShuffleAvailable) this._hasShuffleAvailable = true;

        if (notifyUpdate)
            ShuffleManager.getInstance().setServerShuffleById(this.getId(), state);
    }

    public isShuffle(): boolean {
        return this._shuffleState;
    }

    public isShuffleAvailable(): boolean {
        return this._hasShuffleAvailable;
    }

    public getMaxSongs(): number {
        return this._maxSongs;
    }

    public setMaxSongs(maxSongs: number, notifyUpdate: boolean = true): void {
        this._maxSongs = maxSongs;

        if (notifyUpdate)
            MaxSongsManager.getInstance().setServerMaxSongs(this.getId(), maxSongs);
    }

    public getVoiceSubscription(): Voice.PlayerSubscription {
        return this._voiceSub;
    }

    public setVoiceSubscription(sub: Voice.PlayerSubscription): void {
        this._voiceSub = sub;
    }

    public getNextSongInQueue(): SongModel {
        const currentIndex = this._songs.indexOf(this.getPlayingSong());

        if (this.isShuffle()) {
            let newIndex = Math.floor(Math.random() * (this._songs.length - 1));
            while (newIndex == currentIndex && this._songs.length > 2) {
                newIndex = Math.floor(Math.random() * (this._songs.length - 1));
            }

            return this._songs[newIndex];
        } else {
            if (currentIndex >= 0 && currentIndex < this._songs.length - 1) {
                return this._songs[currentIndex + 1];
            } else if (currentIndex >= this._songs.length - 1) {
                return this._songs[0];
            } else {
                return null;
            }
        }
    }

    public getVoiceConnection(): Voice.VoiceConnection {
        return Voice.getVoiceConnection(this.getId());
    }

    public joinVoice(disconnectFirst: boolean = false, overrideJoinConfigCheck: boolean = false): void {
        if (!this.getGuild()) return;

        if (!overrideJoinConfigCheck)
            if (this.getVoiceConnection()?.joinConfig.channelId == this.getChannelId()) return;

        if (disconnectFirst)
            this.getVoiceSubscription()?.player?.stop();

        if (!this.getVoiceConnection()) {
            Voice.joinVoiceChannel({
                channelId: this.getChannelId(),
                guildId: this.getId(),
                adapterCreator: this.getGuild().voiceAdapterCreator,
                selfDeaf: true,
                selfMute: false
            });
        } else {
            this.getVoiceConnection().joinConfig.channelId = this.getChannelId();
            this.getVoiceConnection().rejoin();
        }
    }

    public async startPlay(shouldFetchNextSong: boolean = true): Promise<boolean | void> {
        if (this._playLocked) return false;

        const song = this.getPlayingSong();
        if (!song) return false;

        const nextSong = (this.isQueue() && this.getSongs().length > 0 && shouldFetchNextSong) ? this.getNextSongInQueue() : song;
        if (!nextSong) return false;

        if (shouldFetchNextSong)
            this.setPlayingSongId(nextSong.getId());

        if (this.getVoiceSubscription()) {
            this.getVoiceSubscription().unsubscribe();
            this.setVoiceSubscription(null);
        }

        try {
            let voiceConnection: Voice.VoiceConnection = Voice.getVoiceConnection(this.getId());

            const channelObject: discord.GuildChannel = this.getGuild().channels.cache.get(this.getChannelId()) as GuildChannel;
            if (!channelObject) return false;

            if (nextSong.getId() != song.getId())
                this.logger.log('switched to play ' + nextSong.getName() + ' from ' + song.getName() + ' in ' + RadiobotDiscord.getInstance().resolveGuildNameAndId(this.getGuild()));

            this.setState(ServerState.Playing);

            const memmberCount: number = [...channelObject.members.keys()].length;
            if (memmberCount <= 0 || (memmberCount == 1 && channelObject.members.first()?.id == RadiobotDiscord.getInstance().Client.user.id)) return false;

            const player: Voice.AudioPlayer = Voice.createAudioPlayer();
            let playFromApiStream: boolean = false;

            if (!(await SongManager.getInstance().doesCacheEntryExist(nextSong)) || WebApi.isVideoBeingDownloaded(nextSong.getVideoId())) {
                playFromApiStream = true;
                
                if (WebApi.getStatus() && !WebApi.isVideoBeingDownloaded(nextSong.getVideoId())) {
                    WebApi.downloadVideo(nextSong.getVideoId()).catch(() => {
                        this.logger.log('[ERROR] could not download video Id ' + nextSong.getVideoId() + ' because API is not working');
                        RadiobotDiscord.getInstance().sendAdmin('(' + RadiobotDiscord.getInstance().resolveGuildNameAndId(this.getGuild()) + ') Could not download video Id ' + nextSong.getVideoId() + ' because API is not working')
                        this.startPlay();
                    });
                }
            }

            if (playFromApiStream && !WebApi.getStatus()) {
                this.logger.log('skipping streamed audio (' + nextSong.getName() + ') due to api not working');
                this.startPlay();
                return false;
            }

            const file: string = playFromApiStream ? WebApi.buildUrlForVideoId(nextSong.getVideoId()) : path.join(RadioBot.CachePath, FunctionUtils.getMd5(nextSong.getVideoId()) + ".weba");;
            const audioResource = Voice.createAudioResource(file, {
                inputType: Voice.StreamType.WebmOpus
            });

            this.logger.log(RadiobotDiscord.getInstance().resolveGuildNameAndId(this.getGuild()) + ' playing resource ' + file);

            player.play(audioResource);

            const voiceSub = voiceConnection.subscribe(player);

            if (voiceSub) {
                this.setVoiceSubscription(voiceSub);

                Voice.entersState(player, Voice.AudioPlayerStatus.Playing, 5_000).then(() => {
                    setTimeout(() => {
                        const startedPlayingTime = Date.now();
                        player.on(Voice.AudioPlayerStatus.Idle, async () => {
                            const timePassed = Math.round((Date.now() - startedPlayingTime) / 1000);
                            // console.log(timePassed);
                            // console.log(nextSong.getLengthSeconds());
    
                            player.stop();

                            if (!playFromApiStream && !FunctionUtils.isValueInsideErrorMargin(timePassed, nextSong.getLengthSeconds(), 0.05)) {
                                this.logger.log(RadiobotDiscord.getInstance().resolveGuildNameAndId(this.getGuild()) + ' corrupt song ' + nextSong.getName() + ' (' + nextSong.getId() + '): removing cached file');
                                this._playLocked = true;
                                SongManager.getInstance().deleteCacheEntrySync(nextSong).then(() => {
                                    this._playLocked = false;
                                    this.logger.log(RadiobotDiscord.getInstance().resolveGuildNameAndId(this.getGuild()) + ' corrupt song ' + nextSong.getName() + ' (' + nextSong.getId() + '): deleted');
                                    this.startPlay();
                                });
                            } else {
                                this.startPlay();
                            }
                        });
                    }, 500);
                }).catch((r) => {
                    this.logger.log('could not start playing player in ' + this.getId() + ': ' + r);
                    this.startPlay();
                });
            } else {
                console.log("no voice sub");
            }
        } catch(e) {
            this.logger.log('error on startPlayInServer in server ' + this.getId() + ': ' + e);
        }
    }

    public leaveVoice(): void {
        const voiceConnection = this.getVoiceConnection();
        
        if (voiceConnection)
            voiceConnection.destroy();
        
        const voiceSubs = this.getVoiceSubscription();
        if (voiceSubs) {
            voiceSubs.unsubscribe();
            voiceSubs.player.stop();
            this.setVoiceSubscription(null);
        }

        this.clearPlayingSong();
        this.logger.log('left voice channel on ' + this.getId());
    }

    public clearPlayingSong(): void {
        this.setPlayingSongId(-1);
    }

    public disconnect(): void {
        this.setState(ServerState.Disconnected);
        this.leaveVoice();
    }

    public pause(): void {
        if (this.getState() != ServerState.Playing) return;
        this.getVoiceSubscription()?.player.pause();
        this.setState(ServerState.Paused);
    }

    public resume(): void {
        if (this.getState() != ServerState.Paused) return;
        this.getVoiceSubscription()?.player.unpause();
        this.setState(ServerState.Playing);
    }

    public stop(): void {
        this.getVoiceSubscription()?.unsubscribe();
        this.getVoiceSubscription()?.player.stop();
        this.setState(ServerState.Idle);
    }

}

export enum ServerState {
    Idle = 0,
    Playing = 1,
    Paused = 2,
    Disconnected = 3
}