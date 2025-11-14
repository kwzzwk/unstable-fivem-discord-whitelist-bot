import { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, TextChannel, EmbedBuilder } from "discord.js";
import { createTranscript } from "discord-html-transcripts";
import fs from 'fs';
import { SlashCommand } from "../types";
import { bot } from "../index";
import { config } from "../config";

const transcripts:  SlashCommand = {
    data: new SlashCommandBuilder().setName('transcript').setDescription('Luo transcripti tietystä kanavasta')
    .addChannelOption(option => option.setName('channel').setDescription('Kanava, josta transcriptti luodaan')
    .addChannelTypes(ChannelType.GuildAnnouncement, ChannelType.GuildText, ChannelType.AnnouncementThread, ChannelType.PublicThread, ChannelType.PrivateThread).setRequired(true))
    .addIntegerOption(option => option.setName('maara').setDescription('Määrä viestejä, jotka otetaan transcriptiin').setRequired(true).setMaxValue(100000))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers) as SlashCommandBuilder,
    async execute(interaction: any) {
        const channel = interaction.options.getChannel('channel');
        const limit = interaction.options.getInteger('maara');

        //await interaction.reply({ content: 'Sinulle luodaan transcriptiä!'});

        const file = await createTranscript(channel, {
            limit: limit, 
            //returnBuffer: false, 
            filename: `${channel.name.toLowerCase()}-transcript.html`
        });
        
        const cache = bot.client.channels.cache.get(config.TRANSCRIPT) || await bot.client.channels.fetch(config.TRANSCRIPT);
        if (!cache || !(cache instanceof TextChannel)) {
            return interaction.followUp({ content: 'Kanavaa ei löytynyt tai se ei ole tekstikanava', ephemeral: true });
        }
        const msg = await cache.send({content: `<#${channel.id}>`, files: [file] });
        const transcript = new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel('Lataa transcript').setURL(`${msg.attachments.first()?.url}`).setStyle(ButtonStyle.Link))
        const embed = new EmbedBuilder().setTitle('Transcriptisi on valmis').setDescription(`Transcripti kanavasta ${channel}`).setColor('#0f00b5').setFooter({text: 'Lore', iconURL: 'https://cdn.discordapp.com/attachments/1353381108963606629/1353842435578527795/PpvjEdL.png?ex=67e90e45&is=67e7bcc5&hm=4cca11353f3c01a467cd23a6c93e63be768e10cf8f94f4d3ee0ca3e785e4590b&'});
        await interaction.reply({ embeds: [embed], content: '', components: [transcript] });
    }
};
export default transcripts;