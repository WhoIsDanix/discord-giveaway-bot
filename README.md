# discord-giveaway-bot

![GitHub](https://img.shields.io/github/license/WhoIsDanix/discord-giveaway-bot)
![CodeFactor Grade](https://img.shields.io/codefactor/grade/github/WhoIsDanix/discord-giveaway-bot)

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)

Clone of [GiveawayBot](https://github.com/jagrosh/GiveawayBot) on Node.JS using discord.js and MongoDB.

## Usage
### Commands

* /help - Shows the available commands
* /create-giveaway - Interactive giveaway setup
* /start-giveaway <duration> <winners> <prize> - Starts a new giveaway in the current channel. The time can be in seconds, minutes, hours, days or weeks. Specify the time unit with an "s", "m", "h", "d", or "w". For example 30s or 2h
* /end-giveaway <giveaway_id> - Ends a giveaway and picks the appropriate number of winners immediately
* /delete-giveaway <giveaway_id> - Deletes the specified giveaway without picking winners
* /giveaway-list - Lists currently-running giveaways on the server
* /reroll-giveaway <giveaway_id> - Picks a new winner from the specified giveaway
* /settings show - Shows bot's settings on the server
* /settings set color <hex_code> - Sets the color of the embed used for giveaways
* /settings set emoji <emoji> - Sets the emoji used on the button to enter giveaways

## Environment variables
```
DISCORD_TOKEN=
APPLICATION_ID=
MONGODB_CONNECT_URL=

GIVEAWAY_CHECK_INTERVAL=10

MINIMUM_GIVEAWAY_DURATION=10000
MAXIMUM_GIVEAWAY_DURATION=1209600000

MINIMUM_GIVEAWAY_WINNERS=1
MAXIMUM_GIVEAWAY_WINNERS=50

GIVEAWAY_EMBED_DEFAULT_COLOR=00ffff
GIVEAWAY_EMBED_DEFAULT_EMOJI=🎉
```
