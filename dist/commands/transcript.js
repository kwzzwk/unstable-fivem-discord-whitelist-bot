"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const discord_html_transcripts_1 = require("discord-html-transcripts");
const index_1 = require("../index");
const config_1 = require("../config");
const transcripts = {
    data: new discord_js_1.SlashCommandBuilder().setName('transcript').setDescription('Luo transcripti tietystä kanavasta')
        .addChannelOption(option => option.setName('channel').setDescription('Kanava, josta transcriptti luodaan')
        .addChannelTypes(discord_js_1.ChannelType.GuildAnnouncement, discord_js_1.ChannelType.GuildText, discord_js_1.ChannelType.AnnouncementThread, discord_js_1.ChannelType.PublicThread, discord_js_1.ChannelType.PrivateThread).setRequired(true))
        .addIntegerOption(option => option.setName('maara').setDescription('Määrä viestejä, jotka otetaan transcriptiin').setRequired(true).setMaxValue(100000))
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.BanMembers),
    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        const limit = interaction.options.getInteger('maara');
        //await interaction.reply({ content: 'Sinulle luodaan transcriptiä!'});
        const file = await (0, discord_html_transcripts_1.createTranscript)(channel, {
            limit: limit,
            //returnBuffer: false, 
            filename: `${channel.name.toLowerCase()}-transcript.html`
        });
        const cache = index_1.bot.client.channels.cache.get(config_1.config.TRANSCRIPT) || await index_1.bot.client.channels.fetch(config_1.config.TRANSCRIPT);
        if (!cache || !(cache instanceof discord_js_1.TextChannel)) {
            return interaction.followUp({ content: 'Kanavaa ei löytynyt tai se ei ole tekstikanava', ephemeral: true });
        }
        const msg = await cache.send({ content: `<#${channel.id}>`, files: [file] });
        const transcript = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setLabel('Lataa transcript').setURL(`${msg.attachments.first()?.url}`).setStyle(discord_js_1.ButtonStyle.Link));
        const embed = new discord_js_1.EmbedBuilder().setTitle('Transcriptisi on valmis').setDescription(`Transcripti kanavasta ${channel}`).setColor('#0f00b5').setFooter({ text: 'Lore', iconURL: 'https://cdn.discordapp.com/attachments/1353381108963606629/1353842435578527795/PpvjEdL.png?ex=67e90e45&is=67e7bcc5&hm=4cca11353f3c01a467cd23a6c93e63be768e10cf8f94f4d3ee0ca3e785e4590b&' });
        await interaction.reply({ embeds: [embed], content: '', components: [transcript] });
    }
};
exports.default = transcripts;
