const { Events } = require("discord.js");
const Giveaway = require("../models/Giveaway");

module.exports = {
    type: Events.InteractionCreate,

    async execute(interaction) {
        if (!interaction.isAutocomplete()) return;
        
        if (interaction.commandName === "end-giveaway" || interaction.commandName === "delete-giveaway") {
            let giveaways = await Giveaway.find({ guildId: interaction.guildId, ended: false }).select(["messageId", "prize"]).lean();
            interaction.respond(giveaways.map(giveaway => ({ name: giveaway.prize, value: giveaway.messageId })));
        }
    }
};