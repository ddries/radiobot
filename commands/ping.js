module.exports = {
    name: "ping",
    description: "Checks bot working status.",
    execute: (message, args) => {
        message.reply("pong! Bot is working fine.");
    }
};