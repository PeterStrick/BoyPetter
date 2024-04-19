const { CommandInteraction } = require("discord.js");
const Bot = require("../../handlers/client");
const petPetGif = require('pet-pet-gif');
const axios = require("axios");
const sharp = require("sharp");
const fs = require("fs");

module.exports = {
    name: "petpet",
    description: `Pet all the Boys!`,
    type: "CHAT",
    install: "BOTH",
    options: [
        {
            name: "user",
            description: "The Boy to pet",
            type: 6,
            required: true,
        },
        {
            name: "pfp",
            description: "Profile Picture to use",
            required: true,
            type: 4,
            choices: [
                {
                    name: "Server Profile Picture",
                    value: 1,
                },
                {
                    name: "User Profile Picture",
                    value: 2,
                },
            ],
        },
        {
            name: "resolution",
            description: "The Resolution of the GIF in Pixels",
            type: 4,
        },
        {
            name: "delay",
            description: "The Delay of each Frame in ms",
            type: 4,
        },
    ],

    /**
    * @param {Bot} client
    * @param {CommandInteraction} interaction
    */
    run: async (client, interaction) => {

        // Get GIF Resolution and Delay, if unset then use Defaults
        var GIF_resolution = interaction.options.get('resolution');
        var GIF_delay = interaction.options.get('delay');
        if (!GIF_resolution) {GIF_resolution = 128};
        if (!GIF_delay) {GIF_delay = 20};

        const boy = interaction.options.getUser('user');

        console.log(`[${interaction.id}]: Getting WebP`)

        var stupidAssWebP;

        if (interaction.options.get('pfp') == 1) {
            if (!interaction.member) {
                interaction.followUp({ content: `This only works in servers`, ephemeral: true });
                return;
            } else {
                stupidAssWebP = `https://cdn.discordapp.com/guilds/${boy.guildId}/users/${boy.user.id}/avatars/${boy.member.avatar}.webp?size=4096`;
            }
        } else {
            stupidAssWebP = await axios.get(boy.displayAvatarURL(), {
                responseType: 'arraybuffer',
            });
        }
        

        console.log(`[${interaction.id}]: Converting to PNG`)
        const goodPNG = await sharp(stupidAssWebP.data).toFormat('png').toBuffer();

        console.log(`[${interaction.id}]: Generating PetPet GIF`);
        let animatedGif = await petPetGif(goodPNG, {
            resolution: 128, // The width (or height) of the generated gif
            delay: GIF_delay, // Delay between each frame in milliseconds. Defaults to 20.
            backgroundColor: null, // Other values could be the string "rgba(123, 233, 0, 0.5)". Defaults to null - i.e. transparent.
        });

        console.log(`[${interaction.id}]: Sending message`)
        const msg = await interaction.followUp({files: [{ attachment: animatedGif, name: `petpet-${boy.id}.gif`, width: GIF_resolution, height: GIF_resolution }]});
        if (interaction.user.avatar === interaction.member.avatar) {
            await interaction.editReply({content: `This user does not have a server avatar\n[Link](<${msg.attachments.first().proxyURL}>)`, });
        } else {
            await interaction.editReply({content: `[Link](<${msg.attachments.first().proxyURL}>)`, });
        }
    }
}
