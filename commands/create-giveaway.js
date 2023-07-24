const {
    SlashCommandBuilder,
    Interaction,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    PermissionFlagsBits
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("create-giveaway")
        .setDescription("Creates giveaway in a specific channel (interactive)")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    /**
     * Command execution
     * @param {Interaction} interaction 
     */
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId("create-giveaway")
            .setTitle("Create a Giveaway");

        const durationInput = new TextInputBuilder()
            .setCustomId("giveaway-duration")
            .setLabel("Duration")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setPlaceholder("E.x: 10 minutes");

        const numberOfWinnersInput = new TextInputBuilder()
            .setCustomId("giveaway-winners")
            .setLabel("Number of winners")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);
        
        const prizeInput = new TextInputBuilder()
            .setCustomId("giveaway-prize")
            .setLabel("Prize")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);
        
        const descriptionInput = new TextInputBuilder()
            .setCustomId("giveaway-description")
            .setLabel("Description")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false);

        const durationRow = new ActionRowBuilder().addComponents(durationInput);
        const numberOfWinnersRow = new ActionRowBuilder().addComponents(numberOfWinnersInput);
        const prizeRow = new ActionRowBuilder().addComponents(prizeInput);
        const descriptionRow = new ActionRowBuilder().addComponents(descriptionInput);

        modal.addComponents(durationRow, numberOfWinnersRow, prizeRow, descriptionRow);

        interaction.showModal(modal);
    }
};