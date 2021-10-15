import discord, { GuildChannel, MessageEmbed } from "discord.js";
import Radiobot from "../RadioBot";
import Config from "../utils/Config";
import Logger from "../utils/Logger";
import fs from 'fs';
import path from 'path';
import ICommand from "../utils/ICommand";
import PrefixManager from "../managers/PrefixManager";
import ServerManager, { Server, ServerState } from "../managers/ServerManager";
import EmbedHelper, { EmbedColor } from "../helpers/EmbedHelper";

export default class RadiobotDiscord {

    private static _instance: RadiobotDiscord = null;
    private logger: Logger = null;

    public Client: discord.Client = null;
    private _statusWebhook: discord.WebhookClient = null;
    private _statsWebhook: discord.WebhookClient = null;
    private _adminWebhook: discord.WebhookClient = null;

    private _commandsPath: string = "";
    private _commands: discord.Collection<string, ICommand> = null;
    private _aliases: { [k: string]: string } = null;

    private static _activityUpdateTime: number = 30_000; // 0.5 min
    private static _botlistUpdateTime: number = 1800_000; // 0.5 hour

    public resolveGuildNameAndId(guild: discord.Guild): string {
        return guild.name + ' (' + guild.id + ')';
    }

    public sendStatus(text: string): void {
        this._statusWebhook.send({ embeds: [ EmbedHelper.OK(text) ]});
    }

    public sendAdmin(text: string): void {
        this._adminWebhook.send({ embeds: [ EmbedHelper.Info(text) ]});
    }

    public sendStats(embed: MessageEmbed): void {
        // this.logger.log('sent stats to discord log');
        // this._statsWebhook.send({ embeds: [ embed ]});
    }

    public getAllCommands(): discord.Collection<string, ICommand> {
        return this._commands;
    }

    private async OnReady(): Promise<void> {
        this.logger.log('successfully connected to discord as ' + this.Client.user.tag);
        
        if (!this.Client.shard) {
            this.Client.user.setActivity({
                type: "LISTENING",
                name: Radiobot.DefaultPrefix + 'help'
            });
        }
        
        if (this.Client.user.username != Radiobot.BotName && Radiobot.BotName.length > 0) {
            const _old = this.Client.user.username;
            this.Client.user.setUsername(Radiobot.BotName);
            this.logger.log('changed bot name to predefined ' + Radiobot.BotName + ' (old ' + _old + ')');
        }

        await this._loadAllCommands();
        await this._fetchAllGuilds();
        await this._joinAllGuilds();
    }

    private OnError(error): void {
        this.logger.log('discord error ' + error);
    }

    private async OnMessage(m: discord.Message): Promise<void> {
        if (m.author.bot) return;
        if (m.channel.type == 'DM') return;

        const prefix = PrefixManager.getInstance().getPrefixByServerId(m.guildId);

        if (!m.content.startsWith(prefix) && !m.content.startsWith(Radiobot.DefaultPrefix)) return;

        let args = [];
        if (!m.content.startsWith(prefix)) {
            args = m.content.slice(Radiobot.DefaultPrefix.length).trim().split(/ +/);
        } else {
            args = m.content.slice(prefix.length).trim().split(/ +/);
        }

        let command = args.shift().toLocaleLowerCase();

        if (!this._commands.has(command) && this._aliases.hasOwnProperty(command)) {
            command = this._aliases[command];
        }

        try {
            this._commands.get(command)?.run(m, args);
        } catch (e) {
            this.logger.log('could not execute command ' + command + ' in ' + this.resolveGuildNameAndId(m.guild) + ': ' + e)
        }
    }

    private async OnVoiceUpdate(oldState: discord.VoiceState, newState: discord.VoiceState): Promise<void> {
        if (!oldState?.member || !newState?.member || !this.Client?.user) return;

        if (newState.member.id == this.Client.user.id) {
            const _guildId = newState.member.guild.id;
            const _server = ServerManager.getInstance().getServerById(_guildId);
            if (!_server) return;

            if (_server.getState() == ServerState.Disconnected) return;

            if (!newState.channelId || !newState.channel) {
                _server.joinVoice(false, true);
                return;
            } else if (newState.channelId != _server.getChannelId()) {
                try {
                    if (oldState.channelId == _server.getChannelId()) {
                        setTimeout(() => { newState.setChannel(_server.getChannelId(), 'moved bot to fixed channel'); }, 200);
                    }
                } catch (e) {
                    this.logger.log('error on voice state update event on ' + this.resolveGuildNameAndId(_server.getGuild()) + ': ' + e);
                }
            }
        } else {
            const _server = ServerManager.getInstance().getServerById(newState.member.guild.id);
            if (!_server) return;

            if (_server.getState() == ServerState.Paused) return;

            if (oldState.channelId != newState.channelId) {
                if (newState.member.voice) {

                    if (newState.channelId == _server.getChannelId()) {
                        if (newState.channel?.members.size == 2 && _server.getState() != ServerState.Disconnected && _server.getState() != ServerState.Paused) {
                            _server.startPlay(false);
                        }
                    }
                }

                if (oldState.member.voice && oldState.channel && oldState.channel.members.size == 1 && oldState.channel.members.first()?.id == this.Client.user.id) {
                    _server.stop();
                }
            }
        }
    }

    private OnGuildCreate(guild: discord.Guild): void {
        this.logger.log('joined ' + this.resolveGuildNameAndId(guild));
        this.sendStatus('joined ' + this.resolveGuildNameAndId(guild));

        ServerManager.getInstance().createNew(guild);
    }

    private OnGuildDelete(guild: discord.Guild): void {
        this.logger.log('kicked from ' + this.resolveGuildNameAndId(guild));
        this.sendStatus('kicked from ' + this.resolveGuildNameAndId(guild));
    }

    private async _loadAllCommands(): Promise<void> {
        this.logger.log('loading all comands');

        this._commands = new discord.Collection<string, ICommand>();
        this._aliases = {};

        if (!fs.existsSync(this._commandsPath)) fs.mkdirSync(this._commandsPath);

        const commandFiles = fs.readdirSync(this._commandsPath).filter(f => f.endsWith('.js'));
        for (const f of commandFiles) {
            const commandModule: ICommand = (await import(this._resolveCommandPath(f)))['default'];
            this._commands.set(commandModule.name, commandModule);

            if (commandModule.aliases && commandModule.aliases.length > 0) {
                for (const a of commandModule.aliases) {
                    this._aliases[a] = commandModule.name;
                }
            }

            if (Radiobot.Debug)
                this.logger.log('loaded command ' + commandModule.name);
        }

    }

    private async _fetchAllGuilds(): Promise<void> {
        const _localGuilds = this.Client.guilds.cache;
        for (const [ guildId, guildObject ] of _localGuilds) {
            const _server: Server = ServerManager.getInstance().getServerById(guildId);
            if (_server) {
                _server.setGuild(guildObject);
                this.logger.log('added to cache guild ' + this.resolveGuildNameAndId(guildObject));
            }
        }
    }

    private async _joinAllGuilds(): Promise<void> {
        const _allServers = ServerManager.getInstance().getAllServers();
        for (let i = 0; i < _allServers.length; i++) {
            if (!_allServers[i].getGuild()) continue;
            if (_allServers[i].getState() == ServerState.Disconnected) continue;
            if (_allServers[i].getVoiceConnection()) continue;

            _allServers[i].joinVoice();
            if (_allServers[i].getState() == ServerState.Playing)
                _allServers[i].startPlay();

            await (new Promise<void>(res => setTimeout(res, 250)));
        }
    }
    
    private _resolveCommandPath(commandName: string): string {
        return path.join(this._commandsPath, commandName);
    }

    private constructor() {
        this.logger = new Logger('radiobot-discord');
    }

    public async init(): Promise<void> {
        this.Client = new discord.Client({
            intents: [
                discord.Intents.FLAGS.GUILDS,
                discord.Intents.FLAGS.GUILD_MESSAGES,
                discord.Intents.FLAGS.GUILD_VOICE_STATES,
                discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
            ]
        });

        this._statusWebhook = new discord.WebhookClient({ url: Config.getInstance().getKeyOrDefault('StatusWebhook', '')});
        this._statsWebhook = new discord.WebhookClient({ url: Config.getInstance().getKeyOrDefault('StatsWebhook', '')});
        this._adminWebhook = new discord.WebhookClient({ url: Config.getInstance().getKeyOrDefault('AdminWebhook', '')});

        this._commandsPath = path.join(Radiobot.BaseDir, 'commands');

        if (Radiobot.Debug)
            this.logger.log('established commands path to ' + this._commandsPath);

        if (Radiobot.DefaultPrefix.length <= 0) {
            this.logger.log('cannot start discord module, default prefix is empty');
            process.exit(1);
        }

        this.Client.once('ready', this.OnReady.bind(this));
        this.Client.on('error', this.OnError.bind(this));

        this.Client.on('messageCreate', this.OnMessage.bind(this));
        this.Client.on('voiceStateUpdate', this.OnVoiceUpdate.bind(this));
        this.Client.on('guildCreate', this.OnGuildCreate.bind(this));
        this.Client.on('guildDelete', this.OnGuildDelete.bind(this));

        this.logger.log('logging to discord network');
        await this.Client.login(Config.getInstance().getKeyOrDefault('BotToken', '')).catch(e => {
            this.logger.log('could not connect to discord network ' + e);
            process.exit(1);
        });

        if (this.Client.shard) {
            setInterval(() => {
                this.Client.shard.send({
                    op: 'update_act'
                });
            }, 600_000);
        }
    }

    public static getInstance(): RadiobotDiscord {
        if (!this._instance) {
            this._instance = new RadiobotDiscord();
        }

        return this._instance;
    }

}