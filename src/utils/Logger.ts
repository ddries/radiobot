import crypto from 'crypto';

export default class Logger {

    private _prefix: string = "";

    constructor(prefix: string) {
        this._prefix = prefix;
    }

    public log(text: string): void {
        let _logText = this.getFormattedTimestamp() + " ";

        if (this._prefix.length > 0)
            _logText += "[" + this._prefix + "] ";

        _logText += "[" + this.getLogId(_logText + text).substr(0, 10) + "] ";

        _logText += text;

        console.log(_logText);
    }

    private getLogId(log: string): string {
        return crypto.createHash('md5').update(log).digest('hex');
    }

    private getFormattedTimestamp(): string {
        const d: Date = new Date(Date.now());
        return "[" + d.getDate() + "/" + (d.getMonth()+1) + "/" + d.getFullYear() + " | " + (d.getHours() < 10 ? '0' + d.getHours() : d.getHours()) + ":" + (d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes()) + ":" + (d.getSeconds() < 10 ? '0' + d.getSeconds() : d.getSeconds()) + "]";
    }

}