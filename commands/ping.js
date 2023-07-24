const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Ping, pong"),

    /**
     * Command execution
     * @param {import("discord.js").Interaction} interaction
     */
    execute(interaction) {
        interaction.reply({ content: "Pong!", ephemeral: true });
    }
};