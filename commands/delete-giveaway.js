const { SlashCommandBuilder, Interaction, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("delete-giveaway")
        .setDescription("Deletes the giveaway with specific ID")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addStringOption(option =>
            option
                .setName("giveaway_id")
                .setDescription("Giveaway ID")
                .setRequired(true)
                .setAutocomplete(true)
        ),

    /**
     * Command execution
     * @param {Interaction} interaction 
     */
    async execute(interaction) {
        const giveawayId = interaction.options.getString("giveaway_id");
        const result = await interaction.client.giveawayManager.deleteGiveaway(giveawayId);

        if (!result.success) {
            return await interaction.reply({ content: result.message, ephemeral: true });
        }

        await interaction.reply({ content: "✅ Successfully deleted the giveaway.", ephemeral: true });
    }
};