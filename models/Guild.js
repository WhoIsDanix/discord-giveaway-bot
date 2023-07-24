const { Schema, model } = require("mongoose");

const GuildSchema = new Schema({
    id: { type: String, unique: true },
    emoji: { type: String },
    color: { type: String },
});

module.exports = model("Guild", GuildSchema);