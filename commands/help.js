const { EmbedBuilder } = require("@discordjs/builders");
const { SlashCommandBuilder, Interaction } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Shows the list of available commands"),

    /**
     * Command execution
     * @param {Interaction} interaction
     */
    execute(interaction) {
        const fields = [
            {
                name: "General Commands",
                value: `
                    \`/ping\`
                `
            },

            {
                name: "Giveaway Creation Commands",
                value: `
                    \`/start-giveaway\`
                    \`/create-giveaway\`
                `
            },

            {
                name: "Giveaway Manipulation Commands",
                value: `
                    \`/end-giveaway\`
                    \`/delete-giveaway\`
                    \`/reroll-giveaway\`
                    \`/giveaway-list\`
                `
            }
        ];

        const embed = new EmbedBuilder().addFields(fields);
        interaction.reply({ embeds: [embed], ephemeral: true });
    }
};