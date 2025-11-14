"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const config_1 = require("../config");
const removeuser = {
    data: new discord_js_1.SlashCommandBuilder().setName('removeuser').setDescription('Poistaa käyttäjän tiketistä!')
        .addUserOption(option => option.setName('user').setDescription('Poistettava käyttäjä').setRequired(true)).setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.BanMembers),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        if (!user) {
            await interaction.reply({ content: 'Käyttäjää ei löytynyt!', flags: discord_js_1.MessageFlags.Ephemeral });
            return;
        }
        const textchannel = interaction.channel;
        if (!(textchannel.parentId === config_1.config.TICKETCLOSE || textchannel.parentId === config_1.config.TICKETOPEN)) {
            await interaction.reply({ content: 'Voit poistaa käyttäjän vain ticket-closed/ticket-open kanavalta!', flags: discord_js_1.MessageFlags.Ephemeral });
            return;
        }
        const exists = textchannel.permissionOverwrites.cache.get(user.id);
        if (!exists || !exists.allow.has('ViewChannel')) {
            await interaction.reply({
                content: `Käyttäjä <@${user.id}> ei ole edes kanavalla, joten ei voida poistaa!`,
                flags: discord_js_1.MessageFlags.Ephemeral
            });
            return;
        }
        await textchannel.permissionOverwrites.edit(user.id, { ViewChannel: false, SendMessages: false });
        await interaction.reply({ content: `Käyttäjä <@${user.id}> poistettiin ticketistä!` });
    }
};
exports.default = removeuser;
