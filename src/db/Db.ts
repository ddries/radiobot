import mysql from 'mysql2/promise';
import Config from '../utils/Config';
import Logger from '../utils/Logger';

export default class Db {

    private static _instance: Db = null;
    private logger: Logger = null;

    private static _mysql: MySql = null;

    private constructor() {
        this.logger = new Logger('radiobot-database');
    }

    public static getMySqlContext(): MySql {
        return this._mysql;
    }

    public async init(): Promise<void> {
        Db._mysql = await new MySql(
            Config.getInstance().getKeyOrDefault('MySqlHost', ''),
            Config.getInstance().getKeyOrDefault('MySqlPort', -1),
            Config.getInstance().getKeyOrDefault('MySqlDatabase', ''),
            Config.getInstance().getKeyOrDefault('MySqlUsername', ''),
            Config.getInstance().getKeyOrDefault('MySqlPassword', ''),
            this.logger
        ).init();
    }

    public static getInstance(): Db {
        if (!this._instance) {
            this._instance = new Db();
        }

        return this._instance;
    }

}

class MySql {

    private _host: string = "";
    private _port: number = -1;
    private _db: string = "";
    private _user: string = "";
    private _pass: string = "";

    private _conn: mysql.Pool = null;
    private logger: Logger = null;

    constructor(host: string, port: number, db: string, user: string, pass: string, logger: Logger) {
        this._db = db;
        this._host = host;
        this._port = port;
        this._user = user;
        this._pass = pass;

        this.logger = logger;
    }

    public query(query: string, params: any[] | void): Promise<any[]> {
		return this._conn.execute(query, params);
	}

	public async queryGetResult(query: string, params: any[] | void): Promise<any[]> {
		const [ rows ] = await this.query(query, params);
		return rows;
	}

    public async queryGetInsertedId(query: string, params: any[] | void): Promise<number> {
        const [ info ] = await this.query(query, params);
        return info.insertId;
    }

    public async init(): Promise<MySql> {
        this._conn = mysql.createPool({
            host: this._host,
            port: this._port,
            user: this._user,
            database: this._db,
            password: this._pass,
            waitForConnections: true,
            queueLimit: 10
        });

        try {
            await this._conn.execute('SELECT 1;');
            this.logger.log('successfully connected to ' +  this._host + '@' + this._user);
            return this;
        } catch (e) {
            this.logger.log('could not connect to mysql ' +  this._host + '@' + this._user);
            return null;
        }
    }
}