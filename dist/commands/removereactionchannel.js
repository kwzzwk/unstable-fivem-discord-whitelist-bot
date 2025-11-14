"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const database_handler_1 = require("../database-handler");
const removereactionchannel = {
    data: new discord_js_1.SlashCommandBuilder().setName('removereaction').setDescription('Poistaa kaikki reaktio lisäykset kanavalta jossa komentoa käytetään!')
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.BanMembers),
    async execute(interaction) {
        const channel = interaction.channel.id;
        await database_handler_1.db.query('DELETE FROM reactionchannels WHERE id = ?', [channel]);
        interaction.reply({ content: 'Poistit kanavan reaktion lisäykset!', flags: discord_js_1.MessageFlags.Ephemeral });
    }
};
exports.default = removereactionchannel;
