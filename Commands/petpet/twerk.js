const { CommandInteraction } = require("discord.js");
const Bot = require("../../handlers/client");
const axios = require("axios");
const sharp = require("sharp");
const fs = require("fs");

const path = require('path');
const _ = require('lodash');
const GIFEncoder = require('gifencoder');
const Canvas = require('canvas');

module.exports = {
    name: "twerk",
    description: `Twerk to all the Boys!`,
    type: "CHAT",
    install: "BOTH",
    options: [
        {
            name: "top",
            description: "The Boy who twerks",
            type: 6,
            required: false,
        },
        {
            name: "toppfp",
            description: "Profile Picture to use",
            required: false,
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
            name: "bottom",
            description: "The Boy who gets twerked to",
            type: 6,
            required: false,
        },
        {
            name: "bottompfp",
            description: "Profile Picture to use",
            required: false,
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
            description: "The Delay of each Frame in ms (default: 80)",
            type: 4,
        },
    ],

    /**
    * @param {Bot} client
    * @param {CommandInteraction} interaction
    */
    run: async (client, interaction) => {

        // Get GIF Resolution and Delay, if unset then use Defaults
        var GIF_resolution = interaction.options.getInteger('resolution');
        var GIF_delay = interaction.options.getInteger('delay');
        GIF_resolution ? GIF_resolution : GIF_resolution = 128;
        GIF_delay ? GIF_delay : GIF_delay = 80;

        const top = interaction.options.getUser('top') || false;
        const bottom = interaction.options.getUser('bottom') || false;

        console.log(`[${interaction.id}]: Getting WebP`)

        var stupidAssWebPTop;
        var stupidAssWebPBottom;
        var topPng = false;
        var bottomPng = false;

        if (!top && !bottom) {
            interaction.followUp({ content: `You have to choose at least one`, ephemeral: true });
            return;
        }

        if (top) {
            if (!interaction.options.get('toppfp')) {
                interaction.followUp({ content: `You have to select which pfp to use for top`, ephemeral: true });
                return;
            } else if (interaction.options.get('toppfp') == 1) {
                if (!interaction.member) {
                    interaction.followUp({ content: `This only works in servers`, ephemeral: true });
                    return;
                } else {
                    stupidAssWebPTop = `https://cdn.discordapp.com/guilds/${top.guildId}/users/${top.user.id}/avatars/${top.member.avatar}.webp?size=4096`;
                }
            } else {
                stupidAssWebPTop = await axios.get(top.displayAvatarURL(), {
                    responseType: 'arraybuffer',
                });
            }

            console.log(`[${interaction.id}]: Converting Top to PNG`)
            topPng = await sharp(stupidAssWebPTop.data).toFormat('png').toBuffer();
        }

        if (bottom) {
            if (!interaction.options.get('bottompfp')) {
                interaction.followUp({ content: `You have to select which pfp to use for bottom`, ephemeral: true });
                return;
            } else if (interaction.options.get('bottompfp') == 1) {
                if (!interaction.member) {
                    interaction.followUp({ content: `This only works in servers`, ephemeral: true });
                    return;
                } else {
                    stupidAssWebPBottom = `https://cdn.discordapp.com/guilds/${bottom.guildId}/users/${bottom.user.id}/avatars/${bottom.member.avatar}.webp?size=4096`;
                }
            } else {
                stupidAssWebPBottom = await axios.get(bottom.displayAvatarURL(), {
                    responseType: 'arraybuffer',
                });
            }
            console.log(`[${interaction.id}]: Converting Bottom to PNG`)
            bottomPng = await sharp(stupidAssWebPBottom.data).toFormat('png').toBuffer();
        }        

        console.log(`[${interaction.id}]: Generating Twerk GIF`);
        let animatedGif = await createGIF(topPng, bottomPng, {
            resolution: GIF_resolution, // The width (or height) of the generated gif
            delay: GIF_delay, // Delay between each frame in milliseconds. Defaults to 80.
            backgroundColor: null, // Other values could be the string "rgba(123, 233, 0, 0.5)". Defaults to null - i.e. transparent.
        });

        console.log(`[${interaction.id}]: Sending message`)
        const name = top && bottom ? `${top}twerkingto${bottom}` : top ? `${top}twerking` : bottom ? `twerkedto${bottom}` : `error`;
        const msg = await interaction.followUp({files: [{ attachment: animatedGif, name: `twerk-${name}.gif` }]});
        if (interaction.user.avatar === interaction.member.avatar) {
            await interaction.editReply({content: `This user does not have a server avatar\n[Link](<${msg.attachments.first().proxyURL}>)`, });
        } else {
            await interaction.editReply({content: `[Link](<${msg.attachments.first().proxyURL}>)`, });
        }
    }
}

async function createGIF(top, bottom, options) {
    const FRAMES = 7;
    options = _.defaults(options); // Fill in the default option values

    // Create GIF encoder
    const encoder = new GIFEncoder(options.resolution, options.resolution);

    encoder.start();
    encoder.setRepeat(0);
    encoder.setDelay(options.delay);
    encoder.setTransparent();

    // Create canvas and its context
    const canvas = Canvas.createCanvas(options.resolution, options.resolution);
    const ctx = canvas.getContext('2d');

    // Load and resize the face image
    var resizedTop = false;
    var resizedBottom = false;
    if (top) {
        const face = await Canvas.loadImage(top);
        const resizedCanvas = Canvas.createCanvas(50, 50);
        const resizedCtx = resizedCanvas.getContext('2d');
        resizedCtx.drawImage(face, 0, 0, 50, 50);
        resizedTop = await Canvas.loadImage(resizedCanvas.toDataURL());
    }

    if (bottom) {
        const face = await Canvas.loadImage(bottom);
        const resizedCanvas = Canvas.createCanvas(50, 50);
        const resizedCtx = resizedCanvas.getContext('2d');
        resizedCtx.drawImage(face, 0, 0, 50, 50);
        resizedBottom = await Canvas.loadImage(resizedCanvas.toDataURL());
    }

    // Loop and create each frame
    for (let i = 1; i <= FRAMES; i++) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (options.backgroundColor) {
            ctx.fillStyle = options.backgroundColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Load the corresponding frame image
        const framePath = path.join('./settings/protoimg', `${i}.png`);
        const frame = await Canvas.loadImage(framePath);

        // Draw the frame
        ctx.drawImage(frame, 0, 0, options.resolution, options.resolution);

        // Top face
        if (i != 5 && resizedTop) {
            const offsetX = 6;
            const offsetY = i < 5 ? 1 + i * 1.7 : 7.8 - (i - 4) * 1.7;
            ctx.drawImage(resizedTop, offsetX, offsetY, 50, 50);
        }

        // Bottom face
        if (i != 7 && resizedBottom) {
            const offsetX = i < 4 ? 78 + i * 1 : 81 - (i -3) * 1//75
            const offsetY = i < 4 ? 104 - i * 3.5 : 92.5 + (i -3) * 3.5 //100
            const j = 40
            const k = i < 4 ? 28.9 + i * 3.7 : 40 - (i -3) * 3.7
            ctx.drawImage(resizedBottom, offsetX, offsetY, j, k);
        }

        //Thing
        encoder.addFrame(ctx);
    }

    encoder.finish();
    return encoder.out.getData();
}
