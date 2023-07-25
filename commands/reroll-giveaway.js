const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("reroll-giveaway")
        .setDescription("Reroll giveaway with specific ID")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addStringOption(option => option.setName("giveaway_id").setDescription("Giveaway ID").setRequired(true))
        .addIntegerOption(option => option.setName("count").setDescription("New winner count").setMinValue(1)),

    /**
     * Command execution
     * @param {import("discord.js").Interaction} interaction
     */
    async execute(interaction) {
        const giveaway_id = interaction.options.getString("giveaway_id");
        const count = interaction.options.getInteger("count");

        const result = await interaction.client.giveawayManager.rerollGiveaway(interaction, giveaway_id, count);

        if (!result.success) {
            return await interaction.reply({ content: result.message, ephemeral: true });
        }
    }
};