import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from "discord.js";
import { SlashCommand } from "../types";
import { db } from '../database-handler';
import { RowDataPacket } from "mysql2";

const removereactionchannel: SlashCommand = {
    data: new SlashCommandBuilder().setName('removereaction').setDescription('Poistaa kaikki reaktio lisäykset kanavalta jossa komentoa käytetään!')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers) as SlashCommandBuilder,
    async execute(interaction: any) {
        const channel = interaction.channel.id;

        await db.query<RowDataPacket[]>('DELETE FROM reactionchannels WHERE id = ?', [channel]);
        interaction.reply({content: 'Poistit kanavan reaktion lisäykset!', flags: MessageFlags.Ephemeral});
    }
};
export default removereactionchannel;