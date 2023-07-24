const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("end-giveaway")
        .setDescription("Ends the giveaway with specific ID")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addStringOption(
            option => option
                .setName("giveaway_id")
                .setDescription("Giveaway ID")
                .setRequired(true)
                .setAutocomplete(true)
        ),

    /**
     * Command execution
     * @param {import("discord.js").Interaction} interaction
     */
    async execute(interaction) {
        const result = await interaction.client.giveawayManager.endGiveaway(interaction.options.getString("giveaway_id"));

        if (!result.success) {
            return await interaction.reply({ content: result.message, ephemeral: true });
        }

        await interaction.reply({ content: "🎉 Successfully ended the giveaway.", ephemeral: true });
    }
};