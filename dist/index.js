"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bot = void 0;
const bot_1 = require("./bot");
const config_1 = require("./config");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
require("./database-handler");
const express_1 = __importDefault(require("express"));
exports.bot = new bot_1.Bot();
exports.bot.start(config_1.config.TOKEN);
const checkRole = async (discordId) => {
    const guild = await exports.bot.client.guilds.fetch(config_1.config.GUILD);
    const member = await guild.members.fetch(discordId);
    return member && member.roles.cache.has(config_1.config.WHITELISTROLE);
};
const app = (0, express_1.default)();
const port = 30121;
app.get('/check-role/:discordId', (req, res) => {
    const discordId = req.params.discordId;
    checkRole(discordId).then(hasRole => {
        res.json({ hasRole });
    });
});
app.listen(port, () => {
    console.log(`Roolin chekkaus servu: http://127.0.0.1:${port}`);
});
