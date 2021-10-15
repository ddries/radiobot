import Logger from "../utils/Logger";
import discord from 'discord.js';
import EmbedHelper, { EmbedColor } from "../helpers/EmbedHelper";

export default class ReportManager {
    private static _instance: ReportManager = null;
    private _logger: Logger = null;

    private _reports: Map<number, discord.TextChannel> = new Map<number, discord.TextChannel>();

    public create(channel: discord.TextChannel): number {
        let id = 0;
        while (this._reports.has(id)) id++;

        this._reports.set(id, channel);
        return id;
    }

    public attend(reportId: number, text: string): boolean {
        if (!this._reports.has(reportId)) return false;

        const channel = this._reports.get(reportId);
        if (!channel) return false;

        channel.send({ embeds: [ EmbedHelper.generic(text, EmbedColor.OK, 'Your report has been attended') ]});
        this._reports.delete(reportId);

        return true;
    }

    private constructor() {
        this._logger = new Logger("radiobot-queuemanager");
    }

    public async init(): Promise<void> {}

    public static getInstance(): ReportManager {
        if (!this._instance) {
            this._instance = new ReportManager();
        }

        return this._instance;
    }

}