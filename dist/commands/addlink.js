"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const addlink = {
    data: new discord_js_1.SlashCommandBuilder().setName('addlink').setDescription('Lisää linkin viimeisimpään viestiin!')
        .addStringOption(option => option.setName('link').setDescription('Aseta linkki').setRequired(true))
        .addStringOption(option => option.setName('label').setDescription('Aseta napille teksti').setRequired(true))
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.BanMembers),
    async execute(interaction) {
        const link = interaction.options.getString('link');
        const label = interaction.options.getString('label');
        const message = await interaction.channel.messages.fetch({ limit: 1 });
        const button = new discord_js_1.ButtonBuilder()
            .setLabel(label)
            .setURL(`${link}`)
            .setStyle(discord_js_1.ButtonStyle.Link);
        const row = new discord_js_1.ActionRowBuilder().setComponents(button);
        if (!message.first()) {
            return interaction.reply({ content: 'Ei ole viestiä johon lisätä linkkiä!', flags: discord_js_1.MessageFlags.Ephemeral });
        }
        await message.first().edit({ components: [row] });
        await interaction.reply({ content: 'Lisäsit linkin viimeisimpään viestiin!', flags: discord_js_1.MessageFlags.Ephemeral });
    }
};
exports.default = addlink;
