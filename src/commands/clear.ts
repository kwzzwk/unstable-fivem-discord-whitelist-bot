import { SlashCommand } from "../types";
import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from "discord.js";

const clear: SlashCommand = {
    data: new SlashCommandBuilder().setName('clear').setDescription('Poistaa tietyn määrän viestejä kanavalta jossa komentoa käytetään!')
    .addIntegerOption(option => option.setName('amount').setDescription('Poistettavien viestin määrä (1-100)').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers) as SlashCommandBuilder,

    async execute(interaction: any) {
        const amount = interaction.options.getInteger('amount');
        if (amount < 1 || amount > 100) {
            return interaction.reply({content: 'Voit valita vain 1-100 viestiä kerralla!', flags: MessageFlags.Ephemeral});
        }

        try {
            const channel = interaction.channel;
            const messages = await channel.bulkDelete(amount, true);
            return interaction.reply({content: `Poistettiin ${messages.size} viestiä.`, flags: MessageFlags.Ephemeral});
        } catch (error) {
            console.error('Virhe viestin poistamisesssa Clear komennossa', error)
            return interaction.reply({content: 'Tapahtui virhe viestien poistamisessa.', flags: MessageFlags.Ephemeral});
        }
    }
};

export default clear;