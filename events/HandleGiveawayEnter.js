const { Events, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    type: Events.InteractionCreate,

    async execute(interaction) {
        if (!interaction.isButton()) return;

        if (interaction.customId === "enter-giveaway") {
            const result = await interaction.client.giveawayManager.enterGiveaway(interaction.member, interaction.message.id);

            if (result.modifiedCount === 0) {
                const leaveButton = new ButtonBuilder()
                    .setCustomId("leave-giveaway")
                    .setLabel("Leave Giveaway")
                    .setStyle(ButtonStyle.Danger);

                const row = new ActionRowBuilder().addComponents(leaveButton);

                return interaction.reply({ content: "You have already entered this giveaway!", ephemeral: true, components: [row] });
            }

            await interaction.client.giveawayManager.updateGiveawayEmbed(interaction.message.id);
            await interaction.reply({ content: "✅ You successfully entered the giveaway!", ephemeral: true });
        }
    }
};