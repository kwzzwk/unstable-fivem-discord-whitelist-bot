import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, EmbedBuilder, TextChannel, MessageFlags } from "discord.js";
import { SlashCommand } from "../types";

const embed: SlashCommand = {
    data: new SlashCommandBuilder().setName('luoembed').setDescription('Luo embed viesti!')
        .addStringOption(option => option.setName('msg').setDescription('Aseta viestille normaalia tekstiä').setRequired(false))
        .addStringOption(option => option.setName('title').setDescription('string || number').setRequired(false))
        .addStringOption(option => option.setName('desc').setDescription('string || number').setRequired(false))
        .addStringOption(option => option.setName('footer').setDescription('Aseta footer teksti, default: Lore').setRequired(false))
        .addStringOption(option => option.setName('color').setDescription('string || number').setRequired(false).setMaxLength(6).setMinLength(6))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers) as SlashCommandBuilder,
    async execute(interaction: ChatInputCommandInteraction) {
        const title = interaction.options.getString('title') || 'Title';
        let desc = interaction.options.getString('desc') || 'Description';
        let color = interaction.options.getString('color') || '4287f5';
        let defaultxt = interaction.options.getString('msg') || '';
        const footer = interaction.options.getString('footer') || 'Lore';

        desc = desc.replace(/\\n/g, '\n');
        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(desc)
            .setColor(`#${color}`)
            .setTimestamp()
            .setFooter({text: footer, iconURL: 'https://cdn.discordapp.com/attachments/1353381108963606629/1353842435578527795/PpvjEdL.png?ex=67e90e45&is=67e7bcc5&hm=4cca11353f3c01a467cd23a6c93e63be768e10cf8f94f4d3ee0ca3e785e4590b&'})

        if (interaction.channel && interaction.channel instanceof TextChannel) {
            await interaction.channel.send({ content: defaultxt, embeds: [embed] });
            await interaction.reply({ content: "Suoritit embed komennon", flags: MessageFlags.Ephemeral });
        } else {
            await interaction.reply({ content: "Botti ei voi lähettää viestiä tälle kanavalle!", flags: MessageFlags.Ephemeral });
        }
    }
};
export default embed;