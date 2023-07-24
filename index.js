require("dotenv").config();

const fs = require("fs");
const path = require("path");

const { Client, IntentsBitField, REST, Routes, Collection } = require("discord.js");
const mongoose = require("mongoose");

const GiveawayManager = require("./GiveawayManager");

const client = new Client({
    intents: [IntentsBitField.Flags.Guilds]
});

client.commands = new Collection();
client.giveawayManager = new GiveawayManager(client);

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

async function loadCommands() {
    const commandFiles = fs.readdirSync(path.join(__dirname, "commands"));
    const body = [];

    for (const commandFile of commandFiles) {
        if (!commandFile.endsWith(".js")) continue;
        
        const command = require(path.join(__dirname, "commands", commandFile));
        client.commands.set(command.data.name, command);

        body.push(command.data.toJSON());
    }

    await rest.put(Routes.applicationGuildCommands(process.env.APPLICATION_ID, "1131211339117887518"), { body });
}

function loadEventHandlers() {
    const eventFiles = fs.readdirSync(path.join(__dirname, "events"));

    for (const eventFile of eventFiles) {
        if (!eventFile.endsWith(".js")) continue;
        
        const event = require(path.join(__dirname, "events", eventFile));
        client.on(event.type, (...args) => event.execute(...args));
    }
}

async function main() {
    await mongoose.connect(process.env.MONGODB_CONNECT_URL);
    console.log("Connected to the database successfully.");

    await loadCommands();
    console.log("Loaded and registered slash commands successfully.");

    loadEventHandlers();
    console.log("Loaded event handlers.");

    client.giveawayManager.startCheckingGiveaways();
    console.log("Scheduled giveaway checking task.");

    client.login(process.env.DISCORD_TOKEN);
}

process.on("uncaughtException", err => console.log(err));

main();