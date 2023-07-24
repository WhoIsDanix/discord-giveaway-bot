const { Schema, model } = require("mongoose");

const GiveawaySchema = new Schema({
    guildId: { type: String, required: true },
    channelId: { type: String, required: true },
    messageId: { type: String, required: true },
    userId: { type: String, required: true },
    prize: { type: String, required: true },
    description: { type: String },
    winners: { type: Number, required: true },
    endTime: { type: Number, required: true },
    entries: { type: Array, of: String },
    ended: { type: Boolean, default: false },
});

module.exports = model("Giveaway", GiveawaySchema);