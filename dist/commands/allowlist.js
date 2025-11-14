"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const allowlist = {
    data: new discord_js_1.SlashCommandBuilder().setName('whitelist').setDescription('Luo embed-viestin jossa näkyy whitelist-ohjeet')
        .addStringOption(option => option.setName('title').setDescription('Embed-viestin otsikko').setRequired(false))
        .addStringOption(option => option.setName('desc').setDescription('Embed-viestin kuvaus').setRequired(false))
        .addStringOption(option => option.setName('color').setDescription('Viestille väri (embed, hex)').setRequired(false))
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.BanMembers),
    async execute(interaction) {
        const title = interaction.options.getString('title') || 'Otsikko';
        const desc = interaction.options.getString('desc') || 'Kuvaus';
        const color = interaction.options.getString('color') || '4287f5';
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle(title)
            .setDescription(desc)
            .setColor(`#${color}`)
            .setTimestamp()
            .setFooter({ text: 'Lore Whitelist -System', iconURL: 'https://cdn.discordapp.com/attachments/1353381108963606629/1353842435578527795/PpvjEdL.png?ex=67e90e45&is=67e7bcc5&hm=4cca11353f3c01a467cd23a6c93e63be768e10cf8f94f4d3ee0ca3e785e4590b&' });
        const startAllowlist = new discord_js_1.ButtonBuilder().setCustomId('startWhitelist').setLabel('Aloita Whitelist-hakemus').setStyle(discord_js_1.ButtonStyle.Primary);
        const row = new discord_js_1.ActionRowBuilder().addComponents(startAllowlist);
        await interaction.reply({ content: 'Viesti lähetetään...', flags: discord_js_1.MessageFlags.Ephemeral });
        if (interaction.channel && interaction.channel instanceof discord_js_1.TextChannel) {
            await interaction.channel.send({ embeds: [embed], components: [row] });
        }
    }
};
exports.default = allowlist;
