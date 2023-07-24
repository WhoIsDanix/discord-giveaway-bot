const { SlashCommandBuilder, EmbedBuilder, Interaction, messageLink, hyperlink, PermissionFlagsBits } = require("discord.js");
const ms = require("ms");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("giveaway-list")
        .setDescription("Shows list of currently running giveaways")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    
    /**
     * Command execution
     * @param {Interaction} interaction
     */
    async execute(interaction) {
        let giveaways = await interaction.client.giveawayManager.getGuildGiveaways(interaction.guildId);
        giveaways = giveaways.filter(giveaway => !giveaway.ended);

        if (giveaways.length === 0) {
            return interaction.reply({ content: "💥 There are no giveaways currently running!", ephemeral: true });
        }

        const embedFields = [];

        for (const giveaway of giveaways) {
            const msgLink = messageLink(giveaway.channelId, giveaway.messageId, giveaway.guildId);
            const msgHyperlink = hyperlink(giveaway.messageId, new URL(msgLink));

            embedFields.push({
                name: giveaway.prize,
                value: `${msgHyperlink} | <#${giveaway.channelId}> | Winners: **${giveaway.winners}** | Hosted by: <@${giveaway.userId}> | Ends in: ${ms(giveaway.endTime - Date.now(), { long: true })}`
            });
        }

        const embed = new EmbedBuilder()
            .setTitle("Active Giveaways")
            .addFields(embedFields);

        interaction.reply({ embeds: [embed] });
    }
};