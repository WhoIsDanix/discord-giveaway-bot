const { Events } = require("discord.js");

module.exports = {
    type: Events.ClientReady,

    execute(client) {
        console.log(`Logged in as ${client.user.tag}.`);
    }
};