"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bot = void 0;
const discord_js_1 = require("discord.js");
const status_1 = require("./status");
const config_1 = require("./config");
const commandHandler_1 = require("./commandHandler");
const axios_1 = __importDefault(require("axios"));
const onInteractionEvent_1 = require("./events/onInteractionEvent");
const onMessageCreate_1 = require("./events/onMessageCreate");
/*---------------------------------------------------------------------------*/
/* BOT class */
/*---------------------------------------------------------------------------*/
class Bot {
    client;
    botStatus;
    commands;
    constructor() {
        /*---------------------------------------------------------------------------*/
        /* INTENTS / PERMS */
        /*---------------------------------------------------------------------------*/
        this.client = new discord_js_1.Client({
            intents: [
                discord_js_1.GatewayIntentBits.Guilds,
                discord_js_1.GatewayIntentBits.GuildMembers,
                discord_js_1.GatewayIntentBits.GuildMessages,
                discord_js_1.GatewayIntentBits.MessageContent,
                discord_js_1.GatewayIntentBits.GuildPresences,
                discord_js_1.GatewayIntentBits.GuildMessageReactions,
            ],
        });
        this.botStatus = new status_1.BotStatus(this.client);
        this.commands = new discord_js_1.Collection();
        /*---------------------------------------------------------------------------*/
        /* EVENT HANDLER */
        /*---------------------------------------------------------------------------*/
        this.client.once('ready', () => this.onReady());
        this.client.on('interactionCreate', async (interaction) => await (0, onInteractionEvent_1.onInteraction)(interaction));
        this.client.on('messageCreate', async (message) => await (0, onMessageCreate_1.onMessageCreate)(message));
        this.client.on('guildMemberAdd', async (member) => {
            const channel = member.guild.channels.cache.get(config_1.config.WELCOMECHANNEL) || await member.guild.channels.fetch(config_1.config.WELCOMECHANNEL);
            if (!channel || !(channel instanceof discord_js_1.TextChannel))
                return console.log('Welcome kanavaa ei löytynyt');
            channel.send({ content: `<@${member.user.id}> Tervetuloa palvelimelle!` });
        });
    }
    async onReady() {
        console.log(`${this.client.user?.tag} on päällä!`);
        /*---------------------------------------------------------------------------*/
        /* FIVEM SERVER & BOT STATUS */
        /*---------------------------------------------------------------------------*/
        const getPlayerCount = async () => {
            try {
                const response = await axios_1.default.get(`http://localhost:30120/players.json`);
                return response.data.length;
            }
            catch (error) {
                //console.error('Ongelma pelaaja määrän hakemisessa', error);
                return null;
            }
        };
        setInterval(async () => {
            try {
                const playerCount = await getPlayerCount();
                if (playerCount !== null) {
                    this.botStatus.updateStatus(`Pelaajia [${playerCount}/64]`);
                }
                else {
                    this.botStatus.updateStatus('Nukkuu');
                }
            }
            catch (error) {
                //console.error(error);
                return;
            }
        }, 5000);
        if (this.client.user) {
            await (0, commandHandler_1.registerCommands)(this.client.user.id);
        }
        const loadedCommands = (0, commandHandler_1.loadCommands)();
        for (const [name, command] of loadedCommands) {
            this.commands.set(name, command);
        }
        console.log(`Ladattiin ${this.commands.size} komentoa!`);
        const cache = this.client.channels.cache.get(config_1.config.COMMANDS) || await this.client.channels.fetch((config_1.config.COMMANDS));
        if (!cache || !(cache instanceof discord_js_1.TextChannel)) {
            return console.log('Kanavaa ei löytynyt tai se ei ole tekstikanava: komentojen lähetys kanava');
        }
        try {
            await cache.bulkDelete(100, true);
        }
        catch (error) {
            console.error(`Ongelma ${cache} kanavan tyhjentämisessä!`, error);
        }
        const startTime = Date.now();
        const restart = 2 * 60 * 60 * 1000; // 2 * 60 * 60 * 1000
        const next = new Date(startTime + restart);
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle('Käytettävissä olevat komennot')
            .setDescription('Tässä lista kaikista olemassa olevista komennoista:')
            .setColor('#1c33ff')
            .setTimestamp()
            .setFooter({ text: 'Lore', iconURL: 'https://cdn.discordapp.com/attachments/1353381108963606629/1353842435578527795/PpvjEdL.png?ex=67e90e45&is=67e7bcc5&hm=4cca11353f3c01a467cd23a6c93e63be768e10cf8f94f4d3ee0ca3e785e4590b&' });
        this.commands.forEach((command => {
            embed.addFields({ name: `/${command.data.name}`, value: command.data.description || 'Ei kuvausta', inline: false });
        }));
        embed.addFields({
            name: 'Seuraava restart',
            value: `<t:${Math.floor(next.getTime() / 1000)}:R>`,
            inline: false
        });
        const sendMessage = await cache.send({ embeds: [embed] });
        setInterval(() => {
            const updateembed = discord_js_1.EmbedBuilder.from(embed);
            updateembed.spliceFields(-1, 1);
            updateembed.addFields({
                name: 'Seuraava restart',
                value: `<t:${Math.floor(next.getTime() / 1000)}:R>`,
                inline: false
            });
            sendMessage.edit({ embeds: [updateembed] });
        }, 60 * 1000);
        const untilrestart = next.getTime() - Date.now();
        setTimeout(() => {
            process.exit(0);
        }, untilrestart);
    }
    /*---------------------------------------------------------------------------*/
    /* BOT START / LOGIN */
    /*---------------------------------------------------------------------------*/
    start(token) {
        this.client.login(config_1.config.TOKEN).catch(console.error);
    }
}
exports.Bot = Bot;
