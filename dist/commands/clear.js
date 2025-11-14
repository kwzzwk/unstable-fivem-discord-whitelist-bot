"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const clear = {
    data: new discord_js_1.SlashCommandBuilder().setName('clear').setDescription('Poistaa tietyn määrän viestejä kanavalta jossa komentoa käytetään!')
        .addIntegerOption(option => option.setName('amount').setDescription('Poistettavien viestin määrä (1-100)').setRequired(true))
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.BanMembers),
    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');
        if (amount < 1 || amount > 100) {
            return interaction.reply({ content: 'Voit valita vain 1-100 viestiä kerralla!', flags: discord_js_1.MessageFlags.Ephemeral });
        }
        try {
            const channel = interaction.channel;
            const messages = await channel.bulkDelete(amount, true);
            return interaction.reply({ content: `Poistettiin ${messages.size} viestiä.`, flags: discord_js_1.MessageFlags.Ephemeral });
        }
        catch (error) {
            console.error('Virhe viestin poistamisesssa Clear komennossa', error);
            return interaction.reply({ content: 'Tapahtui virhe viestien poistamisessa.', flags: discord_js_1.MessageFlags.Ephemeral });
        }
    }
};
exports.default = clear;
