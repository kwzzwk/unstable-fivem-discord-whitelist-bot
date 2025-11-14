import { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from 'discord.js';
import { SlashCommand } from '../types';


const reaction: SlashCommand = {
    data: new SlashCommandBuilder().setName('reactionrole').setDescription('Luo reaktion ja sitä reagoimalla saa roolin')
    .addStringOption(option => option.setName('value').setDescription('Aseta emoji tai string').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers) as SlashCommandBuilder,
    async execute(interaction: any) {
        const value = interaction.options.getString('value');
        const messages = await interaction.channel.messages.fetch({limit: 1});

        const button = new ButtonBuilder().setCustomId('reactionrole').setLabel(value).setStyle(ButtonStyle.Primary)
        const row = new ActionRowBuilder().addComponents(button);

        if (!messages.first()) {
            return interaction.reply({content: 'Kanavalla ei ole viestejä joten et voi lisätä reaktiota!'});
        }


        await messages.first().edit({components: [row]});
        await interaction.reply({content: 'Loit reaktio rooli buttonin', flags: MessageFlags.Ephemeral});
    }
};

export default reaction;