const { SlashCommandBuilder, Interaction, PermissionFlagsBits } = require("discord.js");
const ms = require("ms");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("start-giveaway")
        .setDescription("Creates giveaway in a specific channel")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addStringOption(
            option => option
                .setName("duration")
                .setDescription("Duration of the giveaway")
                .setRequired(true)
        )
        .addIntegerOption(
            option => option
                .setName("winners")
                .setDescription("Number of winners")
                .setMinValue(parseInt(process.env.MINIMUM_GIVEAWAY_WINNERS))
                .setMaxValue(parseInt(process.env.MAXIMUM_GIVEAWAY_WINNERS))
                .setRequired(true)
        )
        .addStringOption(
            option => option
                .setName("prize")
                .setDescription("Giveaway prize")
                .setRequired(true)
        ),

    /**
     * Command execution
     * @param {Interaction} interaction 
     */
    async execute(interaction) {
        const duration = ms(interaction.options.getString("duration"));
        const validation = interaction.client.giveawayManager.validateArguments({ duration });

        if (!validation.success) {
            return interaction.reply({
                content: validation.message,
                ephemeral: true
            });
        }

        const winners = interaction.options.getInteger("winners");
        const prize = interaction.options.getString("prize");

        const giveaway = await interaction.client.giveawayManager.createGiveaway({
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            hostedBy: interaction.user,
            duration,
            winners,
            prize
        });
        await interaction.reply({ content: `✅ Successfully created the giveaway (ID = ${giveaway.messageId})`, ephemeral: true });
    }
};