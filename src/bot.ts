import { ActionRowBuilder, ButtonBuilder, Client, Collection, ButtonStyle, EmbedBuilder, GatewayIntentBits, ModalBuilder, TextInputBuilder, TextInputStyle, TextChannel, AnyComponentBuilder } from 'discord.js';
import { BotStatus } from './status';
import { config } from './config';
import { SlashCommand } from './types';
import { loadCommands, registerCommands } from './commandHandler';
import axios from 'axios';
import { onInteraction } from './events/onInteractionEvent';
import { onMessageCreate } from './events/onMessageCreate';


/*---------------------------------------------------------------------------*/ 
                             /* BOT class */
/*---------------------------------------------------------------------------*/ 
export class Bot{
    public client: Client;
    private botStatus: BotStatus;
    public commands: Collection<string, SlashCommand>

    constructor() {
/*---------------------------------------------------------------------------*/ 
                             /* INTENTS / PERMS */
/*---------------------------------------------------------------------------*/ 
        this.client = new Client({
            intents: [
              GatewayIntentBits.Guilds, 
              GatewayIntentBits.GuildMembers, 
              GatewayIntentBits.GuildMessages, 
              GatewayIntentBits.MessageContent,
              GatewayIntentBits.GuildPresences,
              GatewayIntentBits.GuildMessageReactions,
            ],
          });

          this.botStatus = new BotStatus(this.client);
          this.commands = new Collection();
      
/*---------------------------------------------------------------------------*/ 
                            /* EVENT HANDLER */
/*---------------------------------------------------------------------------*/ 
          this.client.once('ready', () => this.onReady());
          this.client.on('interactionCreate', async (interaction) => await onInteraction(interaction));
          this.client.on('messageCreate', async (message) => await onMessageCreate(message))
          this.client.on('guildMemberAdd', async (member) => {
            const channel = member.guild.channels.cache.get(config.WELCOMECHANNEL) || await member.guild.channels.fetch(config.WELCOMECHANNEL);
            if (!channel || !(channel instanceof TextChannel)) return console.log('Welcome kanavaa ei löytynyt');
            channel.send({content: `<@${member.user.id}> Tervetuloa palvelimelle!`})
          })
          
    }
    private async onReady() {
        console.log(`${this.client.user?.tag} on päällä!`);

/*---------------------------------------------------------------------------*/ 
                          /* FIVEM SERVER & BOT STATUS */
/*---------------------------------------------------------------------------*/ 

        const getPlayerCount = async () => {
          try {
            const response = await axios.get(`http://localhost:30120/players.json`);
            return response.data.length;
          } catch(error) {
            //console.error('Ongelma pelaaja määrän hakemisessa', error);
            return null;
          }
        }


        setInterval(async () => {
          try {
            const playerCount = await getPlayerCount();
            if (playerCount !== null) {
              this.botStatus.updateStatus(`Pelaajia [${playerCount}/64]`);
            } else {
              this.botStatus.updateStatus('Nukkuu');
            }
          } catch (error) {
            //console.error(error);
            return;
          }
        }, 5000);

        if (this.client.user) {
          await registerCommands(this.client.user.id);
      }

        const loadedCommands = loadCommands();
        for (const [name, command] of loadedCommands) {
          this.commands.set(name, command);
        }
        console.log(`Ladattiin ${this.commands.size} komentoa!`);
        const cache = this.client.channels.cache.get(config.COMMANDS) || await this.client.channels.fetch((config.COMMANDS));
        if (!cache || !(cache instanceof TextChannel)) {
          return console.log('Kanavaa ei löytynyt tai se ei ole tekstikanava: komentojen lähetys kanava');
        }

        try {
          await cache.bulkDelete(100, true);
        } catch (error) {
          console.error(`Ongelma ${cache} kanavan tyhjentämisessä!`, error)
        }

        const startTime = Date.now();
        const restart = 2 * 60 * 60 * 1000; // 2 * 60 * 60 * 1000
        const next = new Date(startTime + restart);


        const embed = new EmbedBuilder()
          .setTitle('Käytettävissä olevat komennot')
          .setDescription('Tässä lista kaikista olemassa olevista komennoista:')
          .setColor('#1c33ff')
          .setTimestamp()
          .setFooter({text: 'Lore', iconURL: 'https://cdn.discordapp.com/attachments/1353381108963606629/1353842435578527795/PpvjEdL.png?ex=67e90e45&is=67e7bcc5&hm=4cca11353f3c01a467cd23a6c93e63be768e10cf8f94f4d3ee0ca3e785e4590b&'});

          this.commands.forEach((command => {
            embed.addFields({ name: `/${command.data.name}`, value: command.data.description || 'Ei kuvausta', inline: false })
          }))

          embed.addFields({
            name: 'Seuraava restart',
            value: `<t:${Math.floor(next.getTime() / 1000)}:R>`,
            inline: false
          });

          const sendMessage = await cache.send({embeds: [embed]});

          setInterval(() => { 
            const updateembed = EmbedBuilder.from(embed);
            updateembed.spliceFields(-1,  1);
            updateembed.addFields({
              name: 'Seuraava restart',
              value: `<t:${Math.floor(next.getTime() / 1000)}:R>`,
              inline: false
            });
            sendMessage.edit({embeds: [updateembed]});
          }, 60 * 1000)


          const untilrestart = next.getTime() - Date.now();
          setTimeout(() => {
            process.exit(0);
          }, untilrestart)

    }
   
/*---------------------------------------------------------------------------*/ 
                             /* BOT START / LOGIN */
/*---------------------------------------------------------------------------*/ 
    public start(token: string) {
        this.client.login(config.TOKEN).catch(console.error);
    }
}

