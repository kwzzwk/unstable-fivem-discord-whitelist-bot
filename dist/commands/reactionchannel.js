"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const database_handler_1 = require("../database-handler");
const reactionchannel = {
    data: new discord_js_1.SlashCommandBuilder().setName('addreaction').setDescription('Lisää kanava reaktioihin')
        .addStringOption(option => option.setName('emoji').setDescription('Emoji jonka haluat lisätä reaktioksi kanavalle!').setRequired(true))
        .addStringOption(option => option.setName('emoji2').setDescription('Emoji jonka haluat lisätä reaktioksi kanavalle!').setRequired(true))
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.BanMembers),
    async execute(interaction) {
        const channel = interaction.channel.id;
        const emoji1 = interaction.options.getString('emoji');
        const emoji2 = interaction.options.getString('emoji2');
        await database_handler_1.db.query('INSERT INTO reactionchannels VALUES (?, ?, ?)', [channel, emoji1, emoji2]);
        interaction.reply({ content: 'Lisäsit kanavalle reaktio emojit!', ephemeral: true });
    }
};
exports.default = reactionchannel;
