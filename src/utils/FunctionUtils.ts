import crypto from 'crypto';

export default class FunctionUtils {
    public static getMd5(plain: string): string {
        return crypto.createHash('md5').update(plain).digest('hex');
    }

    public static wait(ms: number): Promise<void> {
        return new Promise<void>(resolve => {
            setTimeout(resolve, ms);
        });
    }

    public static sanitizeStringForBd(str: string): string {
        return str.replace(/[^\x00-\x7F]/g, "").replace(/[\\$'"]/g, "\\$&");
    }

    public static formatSecondsIntoTime(seconds: number): string {
        const hours = seconds / 3600;
        const minutes = (hours % 1) * 60;
        const secs = (minutes % 1) * 60;

        let result = "";

        // result += hours >= 10 ? Math.floor(hours) : ("0" + Math.floor(hours)) + ":";
        result += minutes >= 10 ? Math.floor(minutes) : ("0" + Math.floor(minutes)) + ":";
        result += secs >= 10 ? Math.floor(secs) : ("0" + Math.floor(secs));

        return result;
    }

    public static isValueInsideErrorMargin(value: number, baseExpectedValue: number, errorMargin: number): boolean {
        const topMargin = baseExpectedValue + (baseExpectedValue * errorMargin);
        const bottomMargin = baseExpectedValue - (baseExpectedValue * errorMargin);

        return value < topMargin && value > bottomMargin;
    }
}