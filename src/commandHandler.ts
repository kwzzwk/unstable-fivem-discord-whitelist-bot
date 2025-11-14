import { readdirSync } from "fs";
import { join } from "path";
import { SlashCommand } from "./types";
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import { config } from './config';

export const loadCommands = () => {
    const commands = new Map<string, SlashCommand>();
    const commandFiles = readdirSync(join(__dirname, 'commands')).filter(file => file.endsWith('.ts') || file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(`./commands/${file}`).default;

        if (command && command.data && command.data.name) {
            commands.set(command.data.name, command);
        } else {
            console.error(`Komennolta '${file}' puuttuu 'data' tai 'data.name'!`);
        }
    }
    return commands;
}

export const registerCommands = async (clientId: string) => {
    const commands = loadCommands();

    const rest = new REST({ version: '10' }).setToken(config.TOKEN);

    try {
        console.log('Rekisteröidään komennot Discordiin...');

        await rest.put(Routes.applicationCommands(clientId), {
            body: Array.from(commands.values()).map(command => command.data.toJSON())
        });

        console.log('Komennot rekisteröity Discordiin!');
    } catch (error) {
        console.error('Komennon rekisteröinti epäonnistui', error);
    }
};