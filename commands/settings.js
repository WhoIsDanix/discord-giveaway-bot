const { SlashCommandBuilder, Interaction, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const Guild = require("../models/Guild");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("settings")
        .setDescription("Manage giveaway settings")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(subcommand =>
            subcommand
                .setName("show")
                .setDescription("Show settings")
        )
        .addSubcommandGroup(group =>
            group
                .setName("set")
                .setDescription("Set value")
                .addSubcommand(subcommand =>
                    subcommand
                        .setName("color")
                        .setDescription("Set color")
                        .addStringOption(option => option.setName("hex").setDescription("HEX color").setRequired(true))
                )
                .addSubcommand(subcommand =>
                    subcommand
                        .setName("emoji")
                        .setDescription("Set emoji")
                        .addStringOption(option => option.setName("emoji").setDescription("Emoji").setRequired(true))
                )
        ),
    
    /**
     * Command execution
     * @param {Interaction} interaction
     */
    async execute(interaction) {
        const subcommandGroup = interaction.options.getSubcommandGroup();
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "show") {
            const guild = await Guild.findOne({ id: interaction.guildId });

            const description = `
                Server Owner: <@${interaction.guild.ownerId}>
                Giveaway Emoji: ${guild?.emoji || process.env.GIVEAWAY_EMBED_DEFAULT_COLOR}
                Giveaway Color: ${guild?.color || process.env.GIVEAWAY_EMBED_DEFAULT_EMOJI}
            `;

            const embed = new EmbedBuilder().setDescription(description);
            interaction.reply({ embeds: [embed] });
        } else if (subcommandGroup === "set") {
            if (subcommand === "color") {
                const hex = interaction.options.getString("hex");
                if (!hex.startsWith("#")) hex = "#" + hex;

                if (!/^#([\da-f]{3}){1,2}$|^#([\da-f]{4}){1,2}$/i.test(hex)) {
                    return interaction.reply({ content: `💥 I could not convert \`${hex}\` to a valid color!`, ephemeral: true });
                }
                
                await Guild.updateOne({ id: interaction.guildId }, { color: hex }, { upsert: true });
                interaction.reply({ content: `🎉 The embed color for giveaways has beeh changed to \`${hex}\`.`, ephemeral: true });
            } else if (subcommand === "emoji") {
                const emoji = interaction.options.getString("emoji");

                if (!/\p{Emoji_Presentation}/gu.test(emoji)) {
                    return interaction.reply({ content: `💥 \`${emoji}\` is not a valid emoji!`, ephemeral: true });
                }

                await Guild.updateOne({ id: interaction.guildId }, { emoji }, { upsert: true });
                interaction.reply({ content: `🎉 The emoji for giveaways has beeh changed to \`${emoji}\`.`, ephemeral: true });
            }
        }
    }
};