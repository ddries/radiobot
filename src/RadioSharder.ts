import discord from 'discord.js';

import fs from 'fs';
import path from 'path';

(async () => {
    const config:  { [key: string]: any } = JSON.parse(fs.readFileSync(path.join(__dirname, 'radiobot.json'), 'utf-8'));
    const botToken = config['BotToken'];

    const shardManager = new discord.ShardingManager('./RadioBot.js', {
        token: botToken,
        totalShards: 6
    });

    const getTotalServers = () => {
        return new Promise<number>(resolve => {
            shardManager.fetchClientValues('guilds.cache.size').then(results => {
                const total = results.reduce<number>((prev: number, val: number) => prev + val, 0);
                resolve(total);
            });
        });
    };

    const log = (text: string) => {
        console.log(`\u001b[32m${text}\u001b[0m`)
    }

    let areAllReady: boolean = false;

    shardManager.on('shardCreate', shard => {
        log(`Started shard ${shard.id}`);

        shard.on('error', error => {
            log('error on shard ' + shard.id + ': ' + error);
        });

        shard.on('death', _ => {
            log('death on shard ' + shard.id);
        });

        shard.on('disconnect', () => {
            log('disconnect on shard ' + shard.id);
        });

        shard.on('reconnecting', () => {
            log('reconnecting on shard ' + shard.id);
        });

        shard.on('ready', () => {
            log('shard ' + shard.id + ' is now ready');

            if (!areAllReady) return;
            getTotalServers().then(totalServers => {
                shard.eval(`this.user?.setActivity('${config['BotDefaultPrefix']}help | (${shard.id}) ${totalServers} servers')`);
            }).catch(e => {
                log('error fetching all servers (1) ' + e);
            });
        });
    });

    shardManager.spawn().then(shards => {
        areAllReady = true;

        getTotalServers().then(totalServers => {
            shards.forEach(oneShard => {
                // if (oneShard.id == 0) {
                //     oneShard.send({
                //         op: 'ident'
                //     });
                // }

                log(`updating shard ${oneShard.id}`);
                oneShard.eval(`this.user?.setActivity('${config['BotDefaultPrefix']}help | (${oneShard.id}) ${totalServers} servers')`);

                oneShard.on('message', async msg => {
                    const shardId = oneShard.id;
                    const op = msg.op;

                    switch (op) {
                        case 'update_act':
                            const totalServers = await getTotalServers();
                            oneShard.eval(`(
                                () => {
                                    this.user?.setActivity('${config['BotDefaultPrefix']}help | (${shardId}) ${totalServers} servers')
                                }
                            )()`);
                            break;
                    }
                });
            });
        }).catch(e => {
            log('error fetching all servers (3) ' + e);
        });
    });
})();