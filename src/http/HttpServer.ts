import express from 'express';
import * as bodyParser from 'body-parser';
import Config from '../utils/Config';
import VoteManager from '../managers/VoteManager';
import RadiobotDiscord from '../discord/RadiobotDiscord';
import Logger from '../utils/Logger';

export default class HttpServer {
    
    private _app: express.Application = null;
    private _port: number = 3000;

    private logger: Logger = null;

    constructor() {
        this.logger = new Logger('radiobot-web');

        this._app = express();
        this._app.use(bodyParser.json());

        this._port = Config.getInstance().getKeyOrDefault('WebPort', 3000);

        this._app.get('/', (_, res) => {
            res.sendStatus(200);
        });

        this._app.post('/vote', (req, res) => {
            if (req.header('Authorization') != Config.getInstance().getKeyOrDefault('WebToken', ''))
                res.sendStatus(401);

            if (req.body.bot != "778044858760953866" || req.body.type != "upvote")
                res.sendStatus(400);

            const user = req.body.user;
            VoteManager.getInstance().incrementVotesByUserId(user);
            RadiobotDiscord.getInstance().sendStatus(user + ' just voted for radiobot');
            this.logger.log('added new vote of user ' + user);
            res.sendStatus(200);
        });

        this._app.listen(this._port, () => {
            this.logger.log('started webserver at port ' + this._port);
        });
    }

}