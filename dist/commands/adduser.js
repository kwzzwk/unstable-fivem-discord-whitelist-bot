"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const config_1 = require("../config");
const adduser = {
    data: new discord_js_1.SlashCommandBuilder().setName('adduser').setDescription('Lisää käyttäjä tickettiin!')
        .addUserOption(option => option.setName('user').setDescription('Lisättävä käyttäjä').setRequired(true)).setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.BanMembers),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        if (!user) {
            await interaction.reply({ content: 'Käyttäjää ei löytynyt!', flags: discord_js_1.MessageFlags.Ephemeral });
            return;
        }
        const channel = interaction.channel;
        if (!channel || channel.type !== discord_js_1.ChannelType.GuildText) {
            await interaction.reply({ content: 'Tämä komento toimii vain palvelimen tekstikanavissa.', flags: discord_js_1.MessageFlags.Ephemeral });
            return;
        }
        const textChannel = channel;
        if (!(textChannel.parentId === config_1.config.TICKETCLOSE || textChannel.parentId === config_1.config.TICKETOPEN)) {
            await interaction.reply({ content: 'Käyttäjän voi lisätä vain tickettiin!', flags: discord_js_1.MessageFlags.Ephemeral });
            return;
        }
        await textChannel.permissionOverwrites.edit(user, {
            ViewChannel: true,
            SendMessages: true,
            ReadMessageHistory: true,
        });
        await interaction.reply({ content: `Käyttäjä <@${user.id}> lisättiin tickettiin!` });
    }
};
exports.default = adduser;
