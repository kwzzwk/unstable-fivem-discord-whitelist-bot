import { SlashCommandBuilder, PermissionFlagsBits, ChannelType, TextChannel,  MessageFlags,  ChatInputCommandInteraction, ReactionUserManager } from "discord.js";
import { SlashCommand } from "../types";
import { config } from '../config';

const removeuser: SlashCommand = {
    data: new SlashCommandBuilder().setName('removeuser').setDescription('Poistaa käyttäjän tiketistä!')
    .addUserOption(option => option.setName('user').setDescription('Poistettava käyttäjä').setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.BanMembers) as SlashCommandBuilder,
    async execute(interaction: ChatInputCommandInteraction) {
        const user = interaction.options.getUser('user');
        if (!user) {
            await interaction.reply({content: 'Käyttäjää ei löytynyt!', flags: MessageFlags.Ephemeral})
            return;
        }
        const textchannel = interaction.channel as TextChannel;

        if (!(textchannel.parentId === config.TICKETCLOSE || textchannel.parentId === config.TICKETOPEN)) {
            await  interaction.reply({content: 'Voit poistaa käyttäjän vain ticket-closed/ticket-open kanavalta!', flags: MessageFlags.Ephemeral})
            return;
        }

        const exists = textchannel.permissionOverwrites.cache.get(user.id);
        
        if (!exists || !exists.allow.has('ViewChannel')) {
            await interaction.reply({
                content: `Käyttäjä <@${user.id}> ei ole edes kanavalla, joten ei voida poistaa!`,
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        await textchannel.permissionOverwrites.edit(user.id, { ViewChannel: false, SendMessages: false})
        await interaction.reply({content: `Käyttäjä <@${user.id}> poistettiin ticketistä!`})
    }
};

export default removeuser;