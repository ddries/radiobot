import PremiumDriver from "../db/drivers/PremiumDriver";
import Logger from "../utils/Logger";

export default class PremiumManager {
    private static _instance: PremiumManager = null;
    private _logger: Logger = null;

    private _premiumUsers: Map<string, boolean> = null;

    private constructor() {
        this._logger = new Logger("radiobot-premiummanager");
    }

    public activatePremiumForUser(userId: string): void {
        this._premiumUsers.set(userId, true);
        PremiumDriver.setUserPremium(userId);
    }

    public getUserIsPremium(userId: string): boolean {
        return this._premiumUsers.has(userId);
    }

    public async init(): Promise<void> {
        this._premiumUsers = new Map<string, boolean>();

        const users = await PremiumDriver.getAllPremiumUsers();
        for (let user of users) {
            this._premiumUsers.set(user, true);
        }

        this._logger.log('loaded (' + this._premiumUsers.size + ') premium users');
    }

    public static getInstance(): PremiumManager {
        if (!this._instance) {
            this._instance = new PremiumManager();
        }

        return this._instance;
    }

}