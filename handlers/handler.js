const { ApplicationCommandType, ApplicationCommandOptionType } = require("discord.js")
const { readdirSync } = require("fs");
const Bot = require("./client");
const fetch = require("node-fetch");

/**
 *
 * @param {Bot} client
 */

module.exports = async (client) => {
  //Slash Commands
  try {
    let normCommands = [];
    let userCommands = [];
    readdirSync("./Commands").forEach((dir) => {
      const commands = readdirSync(`./Commands/${dir}`).filter((f) =>
        f.endsWith(".js")
      );

    for (const cmd of commands) {
      const command = require(`../Commands/${dir}/${cmd}`);
      if (command.name) {
        switch (command.type) {
          case "CHAT":
            command.type = ApplicationCommandType.ChatInput;
            break;
          case "MESSAGE":
            command.type = ApplicationCommandType.Message;
            break;
          case "USER":
            command.type = ApplicationCommandType.User;
            break;
          default:
            break;
        }
        switch (command.install) {
          case "GUILD":
            command.integration_types = [0];
            command.contexts = [0, 1];
            delete command.install;
            break;
          case "USER":
            command.integration_types = [1];
            command.contexts = [0, 1, 2];
            delete command.install;
            break;
          case "BOTH":
            command.integration_types = [0, 1];
            command.contexts = [0, 1, 2];
            delete command.install;
            break;
          default:
            break;
        }
        if (command.options) {
          command.options.forEach((option) => {
            switch (option.type) {
              case "STRING":
                option.type = ApplicationCommandOptionType.String;
                break;
              case "NUMBER":
                option.type = ApplicationCommandOptionType.Number;
                break;
              case "ROLE":
                option.type = ApplicationCommandOptionType.Role;
                break;
              case "SUB_COMMAND":
                option.type = ApplicationCommandOptionType.Subcommand;
                break;
              case "SUB_COMMAND_GROUP":
                option.type = ApplicationCommandOptionType.SubcommandGroup;
                break;
              default:
                break;
            }
          });
        }
  
        client.commands.set(command.name, command);
        if (command.integration_types.includes(1)) {
          userCommands.push(command);
        } else {
          normCommands.push(command);
        }
      } else {
        console.log(`${cmd} Not Ready`);
      }
    }
    });
    console.log(`${client.commands.size} Commands Loaded`);
    client.on("ready", async () => {
      await client.application.commands.set(normCommands);
      await InstallGlobalCommands(client.config.APP_ID, userCommands);
    });
  } catch(e) {
    console.log(e)
  }

  try {
    let eventCount = 0;
    readdirSync("./events")
      .filter((f) => f.endsWith(".js"))
      .forEach((event) => {
        require(`../events/${event}`);
        eventCount++;
      });
    console.log(`${eventCount} Events Loaded`);
  } catch (e) {
    console.log(e);
  }


// User Command Installer (don't touch :3 )

async function DiscordRequest(endpoint, options) {
  const url = 'https://discord.com/api/v10/' + endpoint;
  if (options.body) options.body = JSON.stringify(options.body);
  const res = await fetch(url, {
    headers: {
      Authorization: `Bot ${client.config.TOKEN}`,
      'Content-Type': 'application/json; charset=UTF-8',
    },
    ...options,
  });
  if (!res.ok) {
    const data = await res.json();
    console.log(res.status);
    throw new Error(JSON.stringify(data));
  }
  return res;
}

async function InstallGlobalCommands(appId, commands) {
  const endpoint = `applications/${appId}/commands`;

  try {
    await DiscordRequest(endpoint, { method: 'PUT', body: commands });
  } catch (err) {
    console.error(err);
  }
}

}