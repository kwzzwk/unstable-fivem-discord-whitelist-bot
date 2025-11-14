"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommands = exports.loadCommands = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const rest_1 = require("@discordjs/rest");
const v10_1 = require("discord-api-types/v10");
const config_1 = require("./config");
const loadCommands = () => {
    const commands = new Map();
    const commandFiles = (0, fs_1.readdirSync)((0, path_1.join)(__dirname, 'commands')).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`./commands/${file}`).default;
        if (command && command.data && command.data.name) {
            commands.set(command.data.name, command);
        }
        else {
            console.error(`Komennolta '${file}' puuttuu 'data' tai 'data.name'!`);
        }
    }
    return commands;
};
exports.loadCommands = loadCommands;
const registerCommands = async (clientId) => {
    const commands = (0, exports.loadCommands)();
    const rest = new rest_1.REST({ version: '10' }).setToken(config_1.config.TOKEN);
    try {
        console.log('Rekisteröidään komennot Discordiin...');
        await rest.put(v10_1.Routes.applicationCommands(clientId), {
            body: Array.from(commands.values()).map(command => command.data.toJSON())
        });
        console.log('Komennot rekisteröity Discordiin!');
    }
    catch (error) {
        console.error('Komennon rekisteröinti epäonnistui', error);
    }
};
exports.registerCommands = registerCommands;
