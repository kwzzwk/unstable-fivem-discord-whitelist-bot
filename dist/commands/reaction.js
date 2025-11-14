"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const reaction = {
    data: new discord_js_1.SlashCommandBuilder().setName('reactionrole').setDescription('Luo reaktion ja sitä reagoimalla saa roolin')
        .addStringOption(option => option.setName('value').setDescription('Aseta emoji tai string').setRequired(true))
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.BanMembers),
    async execute(interaction) {
        const value = interaction.options.getString('value');
        const messages = await interaction.channel.messages.fetch({ limit: 1 });
        const button = new discord_js_1.ButtonBuilder().setCustomId('reactionrole').setLabel(value).setStyle(discord_js_1.ButtonStyle.Primary);
        const row = new discord_js_1.ActionRowBuilder().addComponents(button);
        if (!messages.first()) {
            return interaction.reply({ content: 'Kanavalla ei ole viestejä joten et voi lisätä reaktiota!' });
        }
        await messages.first().edit({ components: [row] });
        await interaction.reply({ content: 'Loit reaktio rooli buttonin', flags: discord_js_1.MessageFlags.Ephemeral });
    }
};
exports.default = reaction;
