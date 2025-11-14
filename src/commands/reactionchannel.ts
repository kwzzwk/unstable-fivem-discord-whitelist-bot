import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import { SlashCommand } from "../types";
import { db } from '../database-handler';
import { RowDataPacket } from "mysql2";

const reactionchannel: SlashCommand = {
    data: new SlashCommandBuilder().setName('addreaction').setDescription('Lisää kanava reaktioihin')
    .addStringOption(option => option.setName('emoji').setDescription('Emoji jonka haluat lisätä reaktioksi kanavalle!').setRequired(true))
    .addStringOption(option => option.setName('emoji2').setDescription('Emoji jonka haluat lisätä reaktioksi kanavalle!').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers) as SlashCommandBuilder,
    async execute(interaction: any) {
        const channel = interaction.channel.id;
        const emoji1 = interaction.options.getString('emoji');
        const emoji2 = interaction.options.getString('emoji2');

        await db.query<RowDataPacket[]>('INSERT INTO reactionchannels VALUES (?, ?, ?)', [channel, emoji1, emoji2]);
        interaction.reply({content: 'Lisäsit kanavalle reaktio emojit!', ephemeral: true});
    }
};
export default reactionchannel;