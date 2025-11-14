import { SlashCommandBuilder, TextChannel, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } from "discord.js";
import { SlashCommand } from "../types";

const allowlist: SlashCommand = {
    data: new SlashCommandBuilder().setName('whitelist').setDescription('Luo embed-viestin jossa näkyy whitelist-ohjeet')
    .addStringOption(option => option.setName('title').setDescription('Embed-viestin otsikko').setRequired(false))
    .addStringOption(option => option.setName('desc').setDescription('Embed-viestin kuvaus').setRequired(false))
    .addStringOption(option => option.setName('color').setDescription('Viestille väri (embed, hex)').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers) as SlashCommandBuilder,
    async execute(interaction: any) {
        const title = interaction.options.getString('title') || 'Otsikko';
        const desc = interaction.options.getString('desc') || 'Kuvaus';
        const color = interaction.options.getString('color') || '4287f5';
        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(desc)
            .setColor(`#${color}`)
            .setTimestamp()
            .setFooter({text: 'Lore Whitelist -System', iconURL: 'https://cdn.discordapp.com/attachments/1353381108963606629/1353842435578527795/PpvjEdL.png?ex=67e90e45&is=67e7bcc5&hm=4cca11353f3c01a467cd23a6c93e63be768e10cf8f94f4d3ee0ca3e785e4590b&'});

            const startAllowlist = new ButtonBuilder().setCustomId('startWhitelist').setLabel('Aloita Whitelist-hakemus').setStyle(ButtonStyle.Primary)
            const row = new ActionRowBuilder().addComponents(startAllowlist);
            await interaction.reply({content: 'Viesti lähetetään...', flags: MessageFlags.Ephemeral});

            if (interaction.channel && interaction.channel instanceof TextChannel) {
                await interaction.channel.send({embeds: [embed], components: [row]})
            }
    }
};
export default allowlist;