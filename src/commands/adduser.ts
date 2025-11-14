import { SlashCommandBuilder, PermissionFlagsBits, ChannelType, TextChannel,  EmbedBuilder, MessageFlags,  ChatInputCommandInteraction } from "discord.js";
import { SlashCommand } from "../types";
import { config } from '../config';
const adduser: SlashCommand = {
    data: new SlashCommandBuilder().setName('adduser').setDescription('Lisää käyttäjä tickettiin!')
    .addUserOption(option => option.setName('user').setDescription('Lisättävä käyttäjä').setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.BanMembers) as SlashCommandBuilder,
    async execute(interaction: ChatInputCommandInteraction) {
        const user = interaction.options.getUser('user');
        if (!user) {
            await interaction.reply({ content: 'Käyttäjää ei löytynyt!', flags: MessageFlags.Ephemeral });
            return;
        }
    
        const channel = interaction.channel;
    
        if (!channel || channel.type !== ChannelType.GuildText) {
            await interaction.reply({ content: 'Tämä komento toimii vain palvelimen tekstikanavissa.', flags: MessageFlags.Ephemeral });
            return;
        }
    
        const textChannel = channel as TextChannel;
    
        if (!(textChannel.parentId === config.TICKETCLOSE || textChannel.parentId === config.TICKETOPEN)) {
            await interaction.reply({ content: 'Käyttäjän voi lisätä vain tickettiin!', flags: MessageFlags.Ephemeral });
            return;
        }
    
        await textChannel.permissionOverwrites.edit(user, {
            ViewChannel: true,
            SendMessages: true,
            ReadMessageHistory: true,
        });
    
        await interaction.reply({ content: `Käyttäjä <@${user.id}> lisättiin tickettiin!`});
    }
};
export default adduser;