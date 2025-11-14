import { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags,  ChatInputCommandInteraction } from "discord.js";
import { SlashCommand } from "../types";

const addlink: SlashCommand = {
    data: new SlashCommandBuilder().setName('addlink').setDescription('Lisää linkin viimeisimpään viestiin!')
        .addStringOption(option => option.setName('link').setDescription('Aseta linkki').setRequired(true))
        .addStringOption(option => option.setName('label').setDescription('Aseta napille teksti').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers) as SlashCommandBuilder,
    async execute(interaction: any) {
        const link = interaction.options.getString('link') as string;
        const label = interaction.options.getString('label') as string;
        const message = await interaction.channel.messages.fetch({limit: 1});

        const button = new ButtonBuilder()
            .setLabel(label)
            .setURL(`${link}`)
            .setStyle(ButtonStyle.Link);

        const row = new ActionRowBuilder().setComponents(button);

        if (!message.first()) {
            return interaction.reply({content: 'Ei ole viestiä johon lisätä linkkiä!', flags: MessageFlags.Ephemeral});
        }

        await message.first().edit({components: [row]});
        await interaction.reply({content: 'Lisäsit linkin viimeisimpään viestiin!', flags: MessageFlags.Ephemeral});
    }
};
 export default addlink;