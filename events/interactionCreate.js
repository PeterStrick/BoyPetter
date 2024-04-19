const client = require("../index");
const { Collection } = require("discord.js");
const { ApplicationCommandOptionType } = require("discord.js");

client.on("interactionCreate", async (interaction) => {
    if (interaction.isCommand()) {
        await interaction.deferReply({ ephemeral: false }).catch((e) => {});
        const cmdName = interaction.commandName;
        const cmd = client.commands.get(cmdName);
        if (!cmd) {
            interaction.reply({ content: `Command not found \`${cmdName}\``, ephemeral: true });
            return;
        } else {
            const args = [];
            for (let option of interaction.options.data) {
                if (option.type === ApplicationCommandOptionType.Subcommand) {
                    if (option.name) args.push(option.name);
                    option.options?.forEach((x) => {
                        if (x.value) args.push(x.value);
                    });
                } else if (option.value) {
                    args.push(option.value);
                }
            }

            if (cooldown(interaction, cmd)) {
                interaction.reply(`Cooldown ${cooldown(interaction, cmd).toFixed()}`);
                return;
            } else {
                cmd.run(client, interaction, args)
            }
        }
    }

    if (interaction.isContextMenuCommand()) {
        await interaction.deferReply({ ephemeral: true }).catch(/* GRACEFAIL */);
        const command = client.commands.get(interaction.commandName);
        if (command) command.run(client, interaction);
    }
});

function cooldown(interaction, cmd) {
    if (!interaction || !cmd || !interaction.guild) return;
    let { client, member } = interaction;
    if (!client.cooldowns.has(cmd.name)) {
        client.cooldowns.set(cmd.name, new Collection());
    }
    const now = Date.now();
    const timestamps = client.cooldowns.get(cmd.name);
    const cooldownAmount = cmd.cooldown * 1000;
    if (timestamps.has(member.id)) {
        const expirationTime = timestamps.get(member.id) + cooldownAmount;
        if (now < expirationTime) {
            return (expirationTime - now) / 1000;
        } else {
            timestamps.set(member.id, now);
            setTimeout(() => timestamps.delete(member.id), cooldownAmount);
            return false;
        }
    } else {
        timestamps.set(member.id, now);
        setTimeout(() => timestamps.delete(member.id), cooldownAmount);
        return false;
    }
}
