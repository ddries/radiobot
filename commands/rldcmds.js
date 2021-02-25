
var core = require('./../core/core.js');

module.exports = {
    name: "rldcmds",
    description: "Reloads bot commands (ADMIN USE).",
    show: false,
    execute: (m, args, discord, client) => {

        if (m.author.id == core.config.admin_id) {
            client.commands.clear();
            let commandFiles = core.discord.getCommandFiles();
            for (let file of commandFiles) {
                delete require.cache[require.resolve('./../commands/' + file)];
                let command = require('./../commands/' + file);
                client.commands.set(command.name, command);
            }

            m.react('✅');
        }
    }
};