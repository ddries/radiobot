const fs = require('fs');

const LogFile = {
    LOAD_LOG: 'logs/load.log',
    COMMON_LOG: 'logs/common.log',
    MYSQL_LOG: 'logs/mysql.log',
    DISCORD_LOG: 'logs/discord.log',
    ERROR_LOG: 'logs/error.log',
    DOWNLOAD_LOG: 'logs/downloads.log'
};
exports.LogFile = LogFile;

async function init() {
    if (typeof fs !== "undefined") {
        for (let logFile in LogFile) {
            if (!fs.existsSync(LogFile[logFile])) {
                fs.writeFileSync(LogFile[logFile], '');
            }
        }
    } else {
        throw new Error("WARNING! FILESYSTEM MODULE IS NOT LOADED");
    }
}
exports.init = init;

function log(message, prefix = "", logFile="") {
    let parsedLogMessage = prefix.length > 0 ? getCurrentTimetamp() + " [" + prefix + "] " + message : message;

    if (logFile.length <= 0) {
        console.log(parsedLogMessage);
    }
    
    if (logFile.length > 0) {
        if (typeof fs !== "undefined") {
            fs.appendFile(logFile, parsedLogMessage+"\n", err => {
                if (err) throw err;
    
                console.log(parsedLogMessage);
            });
        } else {
            throw new Error("WARNING! FILESYSTEM MODULE IS NOT LOADED");
        }
    }
}
exports.log = log;

function getCurrentTimetamp() {
    let d = new Date(Date.now());
    return "[" + d.getDate() + "/" + parseInt(d.getMonth()+1) + "/" + d.getFullYear() + " | " + (d.getHours() < 10 ? '0' + d.getHours() : d.getHours()) + ":" + (d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes()) + ":" + (d.getSeconds() < 10 ? '0' + d.getSeconds() : d.getSeconds()) + "]";
}