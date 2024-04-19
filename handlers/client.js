const { Client, Collection, GatewayIntentBits, Partials } = require("discord.js");

class Bot extends Client {
  constructor() {
    super({
      partials: [
        Partials.Channel,
        Partials.Message,
        Partials.User,
      ],
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
      shards: "auto",
      failIfNotExists: false,
      allowedMentions: {
        parse: ["everyone", "roles", "users"],
        users: [],
        roles: [],
        repliedUser: false,
      },
    });

    this.commands = new Collection();
    this.config = require("../settings/config");
    this.cooldowns = new Collection();
  }

  start(token) {
    ["handler"].forEach((handler) => {
      require(`./${handler}`)(this);
    });
    this.login(token);
  }
}

module.exports = Bot;