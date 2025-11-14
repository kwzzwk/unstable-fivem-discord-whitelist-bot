import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, EmbedBuilder, MessageFlags, ButtonStyle, ActionRowBuilder, ButtonBuilder, TextChannel } from "discord.js";
import { SlashCommand } from "../types";

const ticket: SlashCommand = {
    data: new SlashCommandBuilder().setName('createticketchannel').setDescription('Luo ticket kanava josta voit avata kanavia!')
    .addStringOption(option => option.setName('msg').setDescription('Aseta viestille normaalia tekstiä').setRequired(false))
    .addStringOption(option => option.setName('title').setDescription('Aseta kanavalle nimi').setRequired(false))
    .addStringOption(option => option.setName('desc').setDescription('Aseta kanavalle kuvaus').setRequired(false))
    .addStringOption(option => option.setName('color').setDescription('Aseta kanavalle väri').setRequired(false).setMaxLength(6).setMinLength(6))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers) as SlashCommandBuilder,
    async execute(interaction: ChatInputCommandInteraction) {
        const title = interaction.options.getString('title') || 'Ticket';
        const desc = interaction.options.getString('desc') || 'Ticket';
        const color = interaction.options.getString('color') || '4287f5';

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(desc)
            .setColor(`#${color}`)
            .setTimestamp()
            .setFooter({text: 'Lore', iconURL: 'https://cdn.discordapp.com/attachments/1353381108963606629/1353842435578527795/PpvjEdL.png?ex=67e90e45&is=67e7bcc5&hm=4cca11353f3c01a467cd23a6c93e63be768e10cf8f94f4d3ee0ca3e785e4590b&'})
        
        const ticket = new ButtonBuilder()
            .setCustomId('openticket')
            .setLabel('Avaa Ticket')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(ticket)

        if (interaction.channel instanceof TextChannel) {
            await interaction.channel.send({embeds: [embed], components: [row]});
            interaction.reply({ content: "Loit ticketin avauksen!", flags: MessageFlags.Ephemeral });
        } else {
            console.log('Tiketti kanavan luomisessa joku ongelma!');
        }
    }
};
export default ticket;