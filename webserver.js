const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

var core = require('./core/core.js');

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendStatus(200);
});

app.get('/pay/live', (req, res) => {
  if (req.header('Authorization') == core.config.web_token) {
    const userid = req.query.u;
    if (!userid) {
      res.sendStatus(400);  
    } else {
      core.addUserPack(userid, 4);
    }
  } else {
    res.sendStatus(401);
  }
});

app.get('/pay/queue', (req, res) => {
  if (req.header('Authorization') == core.config.web_token) {
    const userid = req.query.u;
    if (!userid) {
      res.sendStatus(400);  
    } else {
      core.addUserPack(userid, 2);
    }
  } else {
    res.sendStatus(401);
  }
});

app.get('/pay/votes', (req, res) => {
  if (req.header('Authorization') == core.config.web_token) {
    const userid = req.query.u;
    const n = parseInt(req.query.n);
    if (!userid || !n) {
      res.sendStatus(400);  
    } else {
      core.setUserVotes(userid, core.getUserVotes(userid) + n);
    }
  } else {
    res.sendStatus(401);
  }
});

app.get('/pay/shuffle', (req, res) => {
  if (req.header('Authorization') == core.config.web_token) {
    const userid = req.query.u;
    if (!userid) {
      res.sendStatus(400);  
    } else {
      core.addUserPack(userid, 3);
    }
  } else {
    res.sendStatus(401);
  }
});

app.post('/vote', (req, res) => {
  if (req.header('Authorization') == core.config.web_token) {
    if (req.body.bot == "778044858760953866" && req.body.type == "upvote") {
      let user = req.body.user;
      core.mysql.queryGetResult("SELECT * FROM votes WHERE userid=" + user, result => {
        if (result.length > 0) {
            core.mysql.query("UPDATE votes SET votes = votes + 1 WHERE userid = " + user);
        } else {
            core.mysql.query("INSERT INTO votes(userid, votes) VALUES(" + user + ", " + 1 + ")");
        }

        core.addUserVote(user);
        core.discord.sendWebhook(user + " just voted for RadioBot");
        res.sendStatus(200);
      });
    } else {
      res.sendStatus(400);
    }
  } else {
    res.sendStatus(401);
  }
});

function init() {
    app.listen(port, () => {
        core.logs.log("Started web server at port " + port, "WEB", core.logs.LogFile.LOAD_LOG);
    });
    
}
exports.init = init;