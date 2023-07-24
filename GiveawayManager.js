const {
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    messageLink,
    hyperlink,
} = require("discord.js");

const Giveaway = require("./models/Giveaway");
const Guild = require("./models/Guild");

const schedule = require("node-schedule");
const ms = require("ms");

class GiveawayManager {
    /**
     * Create new giveaway manager
     * @param {import("discord.js").Client} client - Discord client that should be associated with this giveaway manager
     */
    constructor(client) {
        this.client = client;
    }

    /**
     * @typedef {{
    *      endTime: number,
    *      winners: number | string,
    *      prize: string,
    *      userId: string,
    *      description: string | undefined,
    *      color: string | undefined
    *      entries: number | 0,
    *      ended: boolean | false
    * }} TGiveawayOptions
     */

    /**
     * Builds giveaway embed
     * @param {TGiveawayOptions} options
     * @returns {EmbedBuilder}
     */
    buildGiveawayEmbed({ endTime, winners, prize, description, userId, color, entries = 0, ended = false }) {
        const endTimeSeconds = (endTime / 1000).toFixed(0);

        const embedDescription = `
            ${description || ""}

            ${ended ? "Ended" : "Ends in"}: <t:${endTimeSeconds}:R> (<t:${endTimeSeconds}:f>)
            Hosted by: <@${userId}>
            Entries: **${entries}**
            Winners: **${winners}**
        `;

        const embed = new EmbedBuilder()
            .setColor(color || process.env.GIVEAWAY_EMBED_DEFAULT_COLOR)
            .setTitle(prize)
            .setDescription(embedDescription)
            .setTimestamp();

        return embed;
    }

    /**
     * Validate giveaway arguments
     * @param {{ duration: number, winners: number | undefined }} options
     * @returns {{ success: boolean, message: string | undefined }}
     */
    validateArguments({ duration, winners }) {
        const minDurationNum = parseInt(process.env.MINIMUM_GIVEAWAY_DURATION);
        const maxDurationNum = parseInt(process.env.MAXIMUM_GIVEAWAY_DURATION);

        if (duration < minDurationNum) {
            const durationProvided = ms(duration, { long: true });
            const minimumDuration = ms(minDurationNum, { long: true });

            return { success: false, message: `💥 The duration you provided (${durationProvided}) was less than the minimum duration (${minimumDuration})!` };
        }

        if (duration > maxDurationNum) {
            const durationProvided = ms(duration, { long: true });
            const maximumDuration = ms(maxDurationNum, { long: true });

            return { success: false, message: `💥 The duration you provided (${durationProvided}) was longer than the maximum duration (${maximumDuration})!` };
        }

        if (!winners) return { success: true };

        const minWinners = parseInt(process.env.MINIMUM_GIVEAWAY_WINNERS);
        const maxWinners = parseInt(process.env.MAXIMUM_GIVEAWAY_WINNERS);

        if (winners < minWinners) {
            return { success: false, message: `💥 The amount of winners must be between ${process.env.MINIMUM_GIVEAWAY_WINNERS} and ${process.env.MAXIMUM_GIVEAWAY_WINNERS}.` };
        }

        if (winners > maxWinners) {
            return { success: false, message: `💥 The amount of winners must be between ${process.env.MINIMUM_GIVEAWAY_WINNERS} and ${process.env.MAXIMUM_GIVEAWAY_WINNERS}.` };
        }

        return { success: true };
    }

    /**
     * Create giveaway
     * @param {{
     *      guildId: string,
     *      channelId: string,
     *      hostedBy: import("discord.js").User,
     *      duration: number,
     *      winners: number,
     *      prize: string,
     *      description: string
     * }} options
     */
    async createGiveaway({ guildId, channelId, hostedBy, duration, winners, prize, description }) {
        const endTime = Date.now() + duration;
        const guild = await Guild.findOne({ id: guildId }).select(["color", "emoji"]).lean();

        const giveawayEmbed = this.buildGiveawayEmbed({
            endTime,
            userId: hostedBy.id,
            winners,
            prize,
            description,
            color: guild?.color,
        });

        const joinButton = new ButtonBuilder()
            .setCustomId("enter-giveaway")
            .setEmoji(guild?.emoji || process.env.GIVEAWAY_EMBED_DEFAULT_EMOJI)
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(joinButton);

        const giveawayChannel = await this.client.channels.fetch(channelId);
        const giveawayMessage = await giveawayChannel.send({ embeds: [giveawayEmbed], components: [row] });

        return await Giveaway.create({
            guildId: guildId,
            channelId: giveawayChannel.id,
            messageId: giveawayMessage.id,
            userId: hostedBy.id,
            winners,
            prize,
            description,
            endTime,
        });
    }

    /**
     * Get guild giveaways
     * @param {string} guildId - Guild ID
     */
    async getGuildGiveaways(guildId) {
        return await Giveaway.find({ guildId, ended: false }).lean();
    }

    /**
     * Update giveaway
     * @param {string} giveawayId - Giveaway ID
     * @param {string | import("discord.js").MessagePayload | import("discord.js").MessageEditOptions} messageOptions - Message edit options
     */
    async updateGiveawayEmbed(giveawayId, messageOptions) {
        const giveaway = await Giveaway.findOne({ messageId: giveawayId }).lean();

        const giveawayGuild = await this.client.guilds.fetch(giveaway.guildId);
        const giveawayChannel = await giveawayGuild.channels.fetch(giveaway.channelId);
        const giveawayMessage = await giveawayChannel.messages.fetch(giveaway.messageId);

        const newEmbed = this.buildGiveawayEmbed({
            ...giveaway,
            entries: giveaway.entries.length,
        });

        await giveawayMessage.edit({ embeds: [newEmbed], ...messageOptions });
    }

    /**
     * Delete the giveaway with specific ID
     * @param {String} giveawayId - Giveaway ID
     * @returns {{ success: boolean, message: string | undefined }}
     */
    async deleteGiveaway(giveawayId) {
        const giveaway = await Giveaway.findOne({ messageId: giveawayId });
        if (!giveaway) return { success: false, message: "Giveaway was not found." };

        const giveawayGuild = await this.client.guilds.fetch(giveaway.guildId);
        const giveawayChannel = await giveawayGuild.channels.fetch(giveaway.channelId);
        const giveawayMessage = await giveawayChannel.messages.fetch(giveaway.messageId);

        await Giveaway.deleteOne({ messageId: giveawayId });
        await giveawayMessage.delete();

        return { success: true };
    }

    /**
     * Make guild member enter the giveaway
     * @param {import("discord.js").GuildMember} member
     * @param {string} giveawayId
     */
    async enterGiveaway(member, giveawayId) {
        return await Giveaway.updateOne({ messageId: giveawayId }, { "$addToSet": { entries: member.id } });
    }

    /**
     * Make guild member leave the giveaway
     * @param {import("discord.js").GuildMember} member
     * @param {string} giveawayId
     */
    async leaveGiveaway(member, giveawayId) {
        return await Giveaway.updateOne({ messageId: giveawayId, ended: false }, { "$pull": { entries: member.id } });
    }

    /**
     * Pick giveaway winners
     * @param {string[]} entries
     * @param {number} count
     * @returns {string[]}
     */
    pickWinners(entries, count) {
        const winners = [];
        const entriesCopy = [...entries];

        for (let i = 0; i < count && entriesCopy.length !== 0; ++i) {
            winners.push(entriesCopy.splice(Math.random() * entriesCopy.length, 1)[0]);
        }

        return winners;
    }

    /**
     * Make winners mention from winners array
     * @param {string[]} winners
     * @returns {string}
     */
    winnersMention(winners) {
        return winners.map(winner => `<@${winner}>`).join(", ");
    }

    /**
     * End giveaway with specific ID
     * @param {string} giveawayId - Giveaway ID
     * @returns {{ success: boolean, message: string | undefined }}
     */
    async endGiveaway(giveawayId) {
        const result = await Giveaway.updateOne({ messageId: giveawayId }, { ended: true });

        if (result.matchedCount === 0) return { success: false, message: "💥 Giveaway was not found." };
        if (result.modifiedCount === 0) return { success: false, message: "💥 This giveaway ended already." };

        const giveaway = await Giveaway.findOne({ messageId: giveawayId });

        const giveawayGuild = await this.client.guilds.fetch(giveaway.guildId);
        const giveawayChannel = await giveawayGuild.channels.fetch(giveaway.channelId);
        const giveawayMessage = await giveawayChannel.messages.fetch(giveaway.messageId);

        if (giveaway.entries.length !== 0) {
            await giveawayMessage.reply(`Congratulations ${winnersMention}! You won the **${giveaway.prize}**!`);
        } else {
            await giveawayMessage.reply("No valid entrants, so a winner could not be determined!");
        }

        const winners = this.pickWinners(giveaway.entries, giveaway.winners);
        const winnersMention = this.winnersMention(winners);

        await this.updateGiveawayEmbed(giveawayId, { components: [] });
        return { success: true };
    }

    /**
     * Reroll the giveaway with specific ID
     * @param {import("discord.js").Interaction} interaction
     * @param {string} giveawayId
     * @param {number | undefined} count
     * @returns {{ success: boolean, message: string | undefined }}
     */
    async rerollGiveaway(interaction, giveawayId, count) {
        const giveaway = await Giveaway.findOne({ messageId: giveawayId }).lean();
        if (!giveaway) return { success: false, message: "Giveaway was not found." };

        const winners = this.pickWinners(giveaway.entries, count || giveaway.winners);
        if (winners.length === 0) return { success: false, message: "No valid entrants, so a winner could not be determined!" };

        const winnersMention = this.winnersMention(winners);

        const msgLink = messageLink(giveaway.channelId, giveaway.messageId, giveaway.guildId);
        const msgHyperlink = hyperlink("↗", new URL(msgLink));

        await interaction.reply(`<@${giveaway.userId}> rerolled the giveaway! Congratulations ${winnersMention}! ${msgHyperlink}`);
        return { success: true };
    }

    startCheckingGiveaways() {
        return schedule.scheduleJob(`*/${process.env.GIVEAWAY_CHECK_INTERVAL} * * * * *`, this.checkGiveaways.bind(this));
    }

    async checkGiveaways() {
        const giveaways = await Giveaway.find({ ended: false }).lean();

        for (const giveaway of giveaways) {
            await this.checkGiveaway(giveaway);
        }
    }

    /**
     * Check giveaway if end time is passed already
     * @param {Giveaway} giveaway - Giveaway to check
     */
    async checkGiveaway(giveaway) {
        if (giveaway.endTime > Date.now()) return;
        this.endGiveaway(giveaway.messageId);
    }
}

module.exports = GiveawayManager;