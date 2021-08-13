const mysql = require('mysql');
const config = require('./core_config.json');
const logs = require('./core_logs.js');

var conn = undefined;

async function init() {
    conn = mysql.createConnection({
        host: config.mysql_host,
        port: config.mysql_port,
        user: config.mysql_username,
        password: config.mysql_password,
        database: config.mysql_database
    });

    logs.log("Started MYSQL connection.", "MYSQL", logs.LogFile.MYSQL_LOG);

    conn.on('error', err => {
        logs.log("Error at MYSQL runtime: " + err, "MYSQL", logs.LogFile.ERROR_LOG);

        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            init();
        } else {
            logs.log("Error code different from 'PROTOCOL_CONNECTION_LOST': " + err, "MYSQL", logs.LogFile.ERROR_LOG);
        }
    });

    exports.connect = connect;
}
exports.init = init;

function query(sql) {
    try {
        if (typeof conn !== "undefined") {
            logs.log("Executed: " + sql, "MYSQL", logs.LogFile.MYSQL_LOG);
            conn.query(sql, (err, res) => {
                if (err)
                    logs.log("ERROR! Executing query " + sql + ": " + err, "MYSQL", logs.LogFile.ERROR_LOG);
                //if (err) throw err;
            });
        } else {
            throw new Error("WARNING! MYSQL CONNECTION IS NOT CREATED");
        }
    } catch (e) {
        logs.log("ERROR! Executing query " + sql + ": " + e, "MYSQL", logs.LogFile.ERROR_LOG);
    }
}
exports.query = query;

function queryGetInsertedId(sql, callback) {
    try {
        if (typeof conn !== "undefined") {
            logs.log("Executed: " + sql, "MYSQL", logs.LogFile.MYSQL_LOG);
            conn.query(sql, (err, res) => {
                if (err)
                    logs.log("ERROR! Executing queryGetInsertedId " + sql + ": " + err, "MYSQL", logs.LogFile.ERROR_LOG);
                //if (err) throw err;
                if (res)
                    callback(res.insertId);
                else
                    callback(-1);
            });
        } else {
            throw new Error("WARNING! MYSQL CONNECTION IS NOT CREATED");
        }
    } catch (e) {
        logs.log("ERROR! Executing queryGetInsertedId " + sql + ": " + e, "MYSQL", logs.LogFile.ERROR_LOG);
    }
}
exports.queryGetInsertedId = queryGetInsertedId;

function queryGetResult(sql, callback) {
    try {
        if (typeof conn !== "undefined") {
            logs.log("Executed: " + sql, "MYSQL", logs.LogFile.MYSQL_LOG);
            conn.query(sql, (err, res, fields) => {
                if (err)
                    logs.log("ERROR! Executing queryGetResult " + sql + ": " + err, "MYSQL", logs.LogFile.ERROR_LOG);
                //if (err) throw err;
                callback(res);
            });
        } else {
            throw new Error("WARNING! MYSQL CONNECTION IS NOT CREATED");
        }
    } catch (e) {
        logs.log("ERROR! Executing queryGetResult " + sql + ": " + e, "MYSQL", logs.LogFile.ERROR_LOG);
    }
}
exports.queryGetResult = queryGetResult;

function connect(callback) {
    if (typeof conn !== "undefined") {
        conn.connect(err => {
            if (err) throw err;
            callback();
        });
    } else {
        throw new Error("WARNING! MYSQL CONNECTION IS NOT CREATED");
    }
}