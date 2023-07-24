const { Events } = require("discord.js");

module.exports = {
    type: Events.InteractionCreate,

    async execute(interaction) {
        if (!interaction.isButton()) return;

        if (interaction.customId === "leave-giveaway") {
            const result = await interaction.client.giveawayManager.leaveGiveaway(interaction.member, interaction.message.reference.messageId);

            if (result.modifiedCount === 0) {
                return interaction.reply({ content: "💥 You already left this giveaway!", ephemeral: true });
            }

            if (result.matchedCount === 0) {
                return interaction.reply({ content: "💥 You cannot enter or leave this giveaway because it has already ended!", ephemeral: true });
            }

            await interaction.client.giveawayManager.updateGiveawayEmbed(interaction.message.reference.messageId);
            await interaction.reply({ content: "✅ You successfully left the giveaway!", ephemeral: true });
        }
    }
};