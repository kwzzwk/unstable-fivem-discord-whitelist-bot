"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const ticket = {
    data: new discord_js_1.SlashCommandBuilder().setName('createticketchannel').setDescription('Luo ticket kanava josta voit avata kanavia!')
        .addStringOption(option => option.setName('msg').setDescription('Aseta viestille normaalia tekstiä').setRequired(false))
        .addStringOption(option => option.setName('title').setDescription('Aseta kanavalle nimi').setRequired(false))
        .addStringOption(option => option.setName('desc').setDescription('Aseta kanavalle kuvaus').setRequired(false))
        .addStringOption(option => option.setName('color').setDescription('Aseta kanavalle väri').setRequired(false).setMaxLength(6).setMinLength(6))
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.BanMembers),
    async execute(interaction) {
        const title = interaction.options.getString('title') || 'Ticket';
        const desc = interaction.options.getString('desc') || 'Ticket';
        const color = interaction.options.getString('color') || '4287f5';
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle(title)
            .setDescription(desc)
            .setColor(`#${color}`)
            .setTimestamp()
            .setFooter({ text: 'Lore', iconURL: 'https://cdn.discordapp.com/attachments/1353381108963606629/1353842435578527795/PpvjEdL.png?ex=67e90e45&is=67e7bcc5&hm=4cca11353f3c01a467cd23a6c93e63be768e10cf8f94f4d3ee0ca3e785e4590b&' });
        const ticket = new discord_js_1.ButtonBuilder()
            .setCustomId('openticket')
            .setLabel('Avaa Ticket')
            .setStyle(discord_js_1.ButtonStyle.Primary);
        const row = new discord_js_1.ActionRowBuilder().addComponents(ticket);
        if (interaction.channel instanceof discord_js_1.TextChannel) {
            await interaction.channel.send({ embeds: [embed], components: [row] });
            interaction.reply({ content: "Loit ticketin avauksen!", flags: discord_js_1.MessageFlags.Ephemeral });
        }
        else {
            console.log('Tiketti kanavan luomisessa joku ongelma!');
        }
    }
};
exports.default = ticket;
