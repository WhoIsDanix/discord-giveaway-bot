const { Events } = require("discord.js");
const ms = require("ms");

module.exports = {
    type: Events.InteractionCreate,

    async execute(interaction) {
        if (!interaction.isModalSubmit()) return;

        if (interaction.customId === "create-giveaway") {
            const duration = ms(interaction.fields.getTextInputValue("giveaway-duration"));
            const winners = parseInt(interaction.fields.getTextInputValue("giveaway-winners"));
            const prize = interaction.fields.getTextInputValue("giveaway-prize");
            const description = interaction.fields.getTextInputValue("giveaway-description");

            const validation = interaction.client.giveawayManager.validateArguments({ duration, winners });
            
            if (!validation.success) {
                return interaction.reply({ content: validation.message, ephemeral: true });
            }

            const giveaway = await interaction.client.giveawayManager.createGiveaway({
                guildId: interaction.guildId,
                channelId: interaction.channelId,
                hostedBy: interaction.user,
                duration, winners, prize, description
            });

            await interaction.reply({ content: `✅ Successfully created the giveaway (ID = ${giveaway.messageId})`, ephemeral: true });
        }
    }
};