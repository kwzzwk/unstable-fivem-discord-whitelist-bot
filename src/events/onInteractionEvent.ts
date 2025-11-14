import { Interaction, TextChannel, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, TextInputBuilder, MessageFlags, ModalBuilder, TextInputStyle, ChannelType, PermissionOverwrites, PermissionFlagsBits, Embed } from 'discord.js';
import { config } from '../config';
import { bot } from "../index";
import { db } from '../database-handler';
import { RowDataPacket, ResultSetHeader } from "mysql2";


export const onInteraction = async (interaction: Interaction | any) => {
          
            //if (!interaction.isCommand()) return;
    
    /*---------------------------------------------------------------------------*/ 
                                 /* MODAL SUBMIT */
    /*---------------------------------------------------------------------------*/ 
    
        if (interaction.isModalSubmit()) {
    /*---------------------------------------------------------------------------*/ 
                        /* Whitelist MODAL / APPLICATION HEADER */
    /*---------------------------------------------------------------------------*/ 
          if (interaction.customId === 'application-header') {
              await interaction.deferReply({ ephemeral: true }); // estää aikakatkaisun

              try {
                const ooc = interaction.fields.getTextInputValue('application-ooc');
                const ic = interaction.fields.getTextInputValue('application-ic');

                const userId = interaction.user.id;
                const splitIndex = Math.floor(userId.length / 2);
                const formattedId = userId.slice(0, splitIndex) + '-' + userId.slice(splitIndex);

                const embedUser = new EmbedBuilder()
                  .setTitle('Hakemuksesi on lähetetty onnituneesti äänestettäväksi!')
                  .setDescription(`Sinulle ilmoitetaan hakemuksen tilanteesta kun se on käsitelty! \n\n**OOC:**\n${ooc}\n\n**IC:**\n${ic}`)
                  .setColor('#1c33ff')
                  .setTimestamp()
                  .setFooter({
                    text: 'Lore Whitelist -System',
                    iconURL: 'https://cdn.discordapp.com/attachments/1353381108963606629/1353842435578527795/PpvjEdL.png',
                  });

                const embed = new EmbedBuilder()
                  .setTitle('Uusi hakemus!')
                  .setDescription(`**OOC:**\n${ooc}\n\n**IC:**\n${ic}`)
                  .setColor('#1c33ff')
                  .setFooter({
                    text: `Lore Whitelist -System • CustomID: ${formattedId}`,
                    iconURL: 'https://cdn.discordapp.com/attachments/1353381108963606629/1353842435578527795/PpvjEdL.png',
                  });

                const upvote = new ButtonBuilder().setCustomId('upvote').setLabel('✅').setStyle(ButtonStyle.Primary);
                const downvote = new ButtonBuilder().setCustomId('downvote').setLabel('❌').setStyle(ButtonStyle.Danger);
                const row = new ActionRowBuilder<ButtonBuilder>().addComponents(upvote, downvote);

                const cache = bot.client.channels.cache.get(config.VOTING) || await bot.client.channels.fetch(config.VOTING);
                if (!cache || !(cache instanceof TextChannel)) {
                  return await interaction.editReply({ content: 'Kanavaa ei löytynyt tai se ei ole tekstikanava' });
                }

                try {
                  await interaction.user.send({ embeds: [embedUser] });
                } catch (err) {
                  const embedError = new EmbedBuilder()
                    .setTitle('Hakemustasi ei voitu lähettää!')
                    .setDescription(`Sinulle ei voida lähettää yksityisviestiä. Tässä kirjoittamasi hakemus:\n\n**OOC:**\n${ooc}\n\n**IC:**\n${ic}`)
                    .setColor('#1c33ff')
                    .setFooter({
                      text: 'Lore',
                      iconURL: 'https://cdn.discordapp.com/attachments/1353381108963606629/1353842435578527795/PpvjEdL.png',
                    });

                  await interaction.followUp({ embeds: [embedError], ephemeral: true });
                  return false;
                }

                const msg = await cache.send({ embeds: [embed], components: [row] });

                let saved = false;
                let attempts = 0;
                const maxAttempts = 10;

                while (!saved && attempts < maxAttempts) {
                  try {
                    await db.query(
                      'INSERT INTO lore_applications (userId, messageidentifier, ooc, ic, upvote, downvote, reacted_users) VALUES (?, ?, ?, ?, ?, ?, ?)',
                      [userId, msg.id, ooc, ic, 0, 0, JSON.stringify([])]
                    );
                    saved = true;
                    console.log('Hakemus tallennettu onnistuneesti.');
                  } catch (error) {
                    attempts++;
                    console.warn(`Tallennus epäonnistui (yritys ${attempts})`, error);
                    await new Promise(res => setTimeout(res, 2000));
                  }
                }

                if (!saved) {
                  console.error('Tallennus epäonnistui liian monta kertaa!');
                  return await interaction.followUp({
                    content: 'Hakemuksen käsittelyssä tapahtui virhe, avaa ticket!',
                    ephemeral: true,
                  });
                }

                await interaction.editReply({ content: 'Hakemus lähetetty onnistuneesti!' });
                console.log(interaction.user.id);

              } catch (error) {
                console.error('Ongelma Hakemus modalin kanssa', error);
                await interaction.editReply({ content: 'Tapahtui virhe käsitellessä hakemusta.' });
              }
            }
          if (interaction.customId === 'deny-header') {
            try {
              const reason = interaction.fields.getTextInputValue('deny-reason');
              const [data] = await db.query<RowDataPacket[]>('SELECT * FROM lore_applications WHERE messageidentifier = ?', [interaction.message.id]);
              if (!data.length || !data[0].messageidentifier) {
                return interaction.reply({ content: 'Hakemusta ei löytynyt, hakemus voi olla käsitelty tai käsittelyssä on ongelma!', flags: MessageFlags.Ephemeral});
              }
              const getApp = data[0];
              const embedUser = new EmbedBuilder()
                .setTitle('Hakemuksesi on valitettavasti hylätty!')
                .setDescription(`Hakemuksesi on hylätty ylläpidon toimesta, syynä: \n \n${reason}`)
                .setColor('#910101')
                .setTimestamp()
                .setFooter({text: 'Lore Whitelist -System', iconURL: 'https://cdn.discordapp.com/attachments/1353381108963606629/1353842435578527795/PpvjEdL.png?ex=67e90e45&is=67e7bcc5&hm=4cca11353f3c01a467cd23a6c93e63be768e10cf8f94f4d3ee0ca3e785e4590b&'});
                const embed = new EmbedBuilder()
                .setTitle(`Hakemus hylätty ylläpidon kautta! \n\nHakemusessa äänestäneiden tulos - ✅ ${data[0].upvote} | ❌ ${data[0].downvote}`)
                .setDescription(`\n \n**Hyväksyjä:** <@${interaction.user.id}> \n\n**Hakemuksen lähettäjä:**\n<@${getApp.userId}>\n\n**OOC:**\n${getApp.ooc}\n\n**IC:**\n${getApp.ic}\n\n**Hylkäyksen syy:**\n${reason}`)
                .setColor('#910101')
                .setTimestamp()
                .setFooter({text: 'Lore Whitelist -System', iconURL: 'https://cdn.discordapp.com/attachments/1353381108963606629/1353842435578527795/PpvjEdL.png?ex=67e90e45&is=67e7bcc5&hm=4cca11353f3c01a467cd23a6c93e63be768e10cf8f94f4d3ee0ca3e785e4590b&'})
  
              const user = await bot.client.users.fetch(getApp.userId);
              try {
                await user.send({embeds: [embedUser]});
              } catch (error) {

              }
              const cache = bot.client.channels.cache.get(config.ARCHIVES) || await bot.client.channels.fetch(config.ARCHIVES);
              if (!cache || !(cache instanceof TextChannel)) {
                return interaction.reply({ content: 'Kanavaa ei löytynyt tai se ei ole tekstikanava', flags: MessageFlags.Ephemeral });
              }
      
              const msg = await cache.send({ embeds: [embed] });
              await db.query<RowDataPacket[]>('DELETE FROM lore_applications WHERE messageidentifier = ?', [interaction.message.id]);
              interaction.reply({content: 'Hylkäsit hakemuksen!', flags: MessageFlags.Ephemeral});
              await interaction.message.delete();
            } catch (error) {
              console.error('Ongelma hakemuksen hylkäämis modalin kanssa', error)
            }
          }
        }
        if (interaction.customId === 'ticket-close-modal') {
          try {
            const reason = interaction.fields.getTextInputValue('ticket-close-reason');
            const embed = new EmbedBuilder()
              .setTitle('Ticket')
              .setDescription(`**Ticket suljettu!** \n\n **Sulkemisen syy**:\n ${reason}`)
              .setColor('#1c33ff')
              .setTimestamp()
              .setFooter({text: 'Lore Ticket -System', iconURL: 'https://cdn.discordapp.com/attachments/1353381108963606629/1353842435578527795/PpvjEdL.png?ex=67e90e45&is=67e7bcc5&hm=4cca11353f3c01a467cd23a6c93e63be768e10cf8f94f4d3ee0ca3e785e4590b&'})
  
              if (interaction.channel.parentId === config.TICKETCLOSE) return interaction.reply({content: 'Ticket on jo suljettu!', flags: MessageFlags.Ephemeral});
              await interaction.channel.setName(`closed-${interaction.channel.name.split('-')[1]}`)
              await interaction.channel.setParent(config.TICKETCLOSE)
              await interaction.reply({content: `Ticket suljettu <@${interaction.user.id}> toimesta`, embeds: [embed]})
          } catch (error) {
            console.error('Ongelma ticketin sulkemisessa', error)
          }
        }

            if (interaction.isButton()) {
    //--------------------------------------------------------------//
                            /* OPEN TICKET*/ 
    //--------------------------------------------------------------//
              if (interaction.customId === 'openticket') {
                try {
                  const [result] = await db.query<ResultSetHeader>('INSERT INTO tickets (creator) VALUES (?)', [interaction.user.id]);
                  const ticketid = result.insertId;
                  const channel = await interaction.guild.channels.create({
                    name: `ticket-${ticketid}`,
                    type: ChannelType.GuildText,
                    parent: config.TICKETOPEN,
                    permissionOverwrites: [
                      {
                        id: interaction.guild.roles.everyone.id,
                        deny: PermissionFlagsBits.ViewChannel,
                      },
                      {
                        id: interaction.user.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
                      },
                      {
                        id: config.STAFFROLE,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
                      }
                    ]
                  })
                  interaction.reply({content: `Avasit uuden ticketin! ${channel}`, flags: MessageFlags.Ephemeral});
                  const embed = new EmbedBuilder()
                    .setTitle(`Ticket`)
                    .setDescription('Tervetuloa tickettiin! \n\nVoit nyt keskustella ylläpidon kanssa!')
                    .setColor('#1c33ff')
                    .setTimestamp()
                    .setFooter({text: 'Lore Ticket -System', iconURL: 'https://cdn.discordapp.com/attachments/1353381108963606629/1353842435578527795/PpvjEdL.png?ex=67e90e45&is=67e7bcc5&hm=4cca11353f3c01a467cd23a6c93e63be768e10cf8f94f4d3ee0ca3e785e4590b&'})
                  const close = new ButtonBuilder().setCustomId('ticketclose').setLabel('Sulje ticketti').setStyle(ButtonStyle.Danger);
                  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(close);
                  await channel.send({content: `<@${interaction.user.id}>`, embeds: [embed], components: [row]});

                } catch (error) {
                  console.error('Ongelma ticketin avaamisessa!', error);
                }
            }

            if (interaction.customId === 'ticketclose') {
              try {
                if (interaction.message.channel.parentId === config.TICKETCLOSE) return interaction.reply({content: 'Ticket on jo suljettu!', flags: MessageFlags.Ephemeral});
                const modal = new ModalBuilder().setCustomId('ticket-close-modal').setTitle('Lore Ticket -System');
                modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder().setCustomId('ticket-close-reason').setLabel('Sulkemisen syy: ').setStyle(TextInputStyle.Paragraph).setMaxLength(300)));
                await interaction.showModal(modal);
              } catch(error) {
                console.error('Ongelma tiketin sulkemisessa!', error)
              }
            }
    
    //--------------------------------------------------------------//
                            /* Whitelist BUTTON*/ 
    //--------------------------------------------------------------//
    
              if (interaction.customId === 'startWhitelist') {
                try {
                  const [app] = await db.query<RowDataPacket[]>('SELECT * FROM lore_applications WHERE userId = ?', [interaction.user.id]);
                  if (app.length > 0) {
                    return interaction.reply({content: 'Sinulla on jo aktiivinen hakemus!', flags: MessageFlags.Ephemeral});
                  }

                  const modal = new ModalBuilder().setCustomId('application-header').setTitle('Whitelist hakemus');
    
                  const fields = [
                    { id: 'application-ooc', label: 'OOC', style: TextInputStyle.Paragraph, maxLength: 900 },
                    { id: 'application-ic', label: 'IC', style: TextInputStyle.Paragraph, maxLength: 900 },
                  ];
    
                  fields.forEach(field => {
                    modal.addComponents(
                      new ActionRowBuilder<TextInputBuilder>().addComponents(
                        new TextInputBuilder().setCustomId(field.id).setLabel(field.label).setStyle(field.style).setMaxLength(field.maxLength))
                    );
                  });

                  await interaction.showModal(modal);
    
                } catch (error) {
                  await interaction.reply({content: 'Ongelma hakemuspohjan avaamisessa, otathan yhteyttä ylläpitoon!', flags: MessageFlags.Ephemeral});
                  console.error('Ongelma startWhitelist buttonissa!', error)
                }
              }
    
    /*---------------------------------------------------------------------------*/ 
                                 /* WHITELIST UP AND DOWN VOTES */
    /*---------------------------------------------------------------------------*/ 
    
              if (interaction.customId === 'upvote') {
                try {
                  const [app] = await db.query<RowDataPacket[]>(
                    'SELECT * FROM lore_applications WHERE messageidentifier = ?',
                    [interaction.message.id]
                  );
              
                  if (app.length === 0) {
                    return interaction.reply({ content: 'Hakemusta ei ole olemassa!', flags: MessageFlags.Ephemeral });
                  }
              
                  const row = app[0];
                  const users = JSON.parse(row.reacted_users || '[]');
              
                  if (users.includes(interaction.user.id)) {
                    return interaction.reply({ content: 'Olet jo reagoinut tähän hakemukseen!', flags: MessageFlags.Ephemeral });
                  }
              
                  users.push(interaction.user.id);
              
                  await db.query<RowDataPacket[]>(
                    'UPDATE lore_applications SET upvote = ?, reacted_users = ? WHERE messageidentifier = ?',
                    [row.upvote + 1, JSON.stringify(users), interaction.message.id]
                  );
              
                  if (row.downvote >= config.VOTELIMIT) {
                    await db.query<RowDataPacket[]>(
                      'DELETE FROM lore_applications WHERE messageidentifier = ?',
                      [interaction.message.id]
                    );
              
                    const embed = new EmbedBuilder()
                      .setTitle(`Hakemus hylätty äänestyksen perusteella! \n\nHakemusessa äänestäneiden tulos - ✅ ${row.upvote + 1} | ❌ ${row.downvote}`)
                      .setDescription(`\n\n**Hakemuksen lähettäjä:**\n<@${row.userId}>\n\n**OOC**\n${row.ooc}\n\n**IC:**\n${row.ic}\n\n`)
                      .setColor('#910101')
                      .setTimestamp()
                      .setFooter({
                        text: 'Lore Whitelist -System',
                        iconURL: 'https://cdn.discordapp.com/attachments/1353381108963606629/1353842435578527795/PpvjEdL.png'
                      });
              
                    const embedUser = new EmbedBuilder()
                      .setTitle('Hakemuksesi on valitettavasti hylätty!')
                      .setDescription('\n\n Voit nyt tehdä uuden hakemuksen! \n\n - Ylläpito ja äänestäjät')
                      .setColor('#910101')
                      .setTimestamp()
                      .setFooter({
                        text: 'Lore Whitelist -System',
                        iconURL: 'https://cdn.discordapp.com/attachments/1353381108963606629/1353842435578527795/PpvjEdL.png'
                      });
              
                    const user = await bot.client.users.fetch(row.userId);
                    try {
                      user.send({ embeds: [embedUser] });
                    } catch (error) {

                    }
              
                    const cache = bot.client.channels.cache.get(config.ARCHIVES) || await bot.client.channels.fetch(config.ARCHIVES);
                    if (!cache || !(cache instanceof TextChannel)) {
                      return interaction.followUp({ content: 'Kanavaa ei löytynyt tai se ei ole tekstikanava', flags: MessageFlags.Ephemeral });
                    }
              
                    const msg = await cache.send({ embeds: [embed] });
                    await db.query<RowDataPacket[]>(
                      'UPDATE lore_applications SET messageidentifier = ? WHERE messageidentifier = ?',
                      [msg.id, interaction.message.id]
                    );
              
                    const originalEmbed = interaction.message.embeds[0];
                    const updatedEmbed = EmbedBuilder.from(originalEmbed);
              
                    const voterNames = await Promise.all(users.map(async (id: string) => {
                      try {
                        const user = await bot.client.users.fetch(id);
                        return `- ${user.username}`;
                      } catch {
                        return '- Tuntematon käyttäjä';
                      }
                    }));
              
                    updatedEmbed.setFields([
                      {
                        name: 'Äänet',
                        value: `${users.length}`,
                        inline: true,
                      },
                      {
                        name: 'Äänestäneet',
                        value: voterNames.join('\n') || 'Ei vielä äänestäjiä',
                        inline: true,
                      }
                    ]);
              
                    await interaction.message.edit({ embeds: [updatedEmbed] });
                    await interaction.reply({ content: 'Äänestit hakemusta!', flags: MessageFlags.Ephemeral });
                    interaction.message.delete();
              
                  } else if (row.upvote + 1 >= config.VOTELIMIT && row.downvote < config.VOTELIMIT) {

                    const embed = new EmbedBuilder()
                      .setTitle(`Uusi hakemus saapunut hyväksyntään! \n\nHakemusessa äänestäneiden tulos - ✅ ${row.upvote + 1} | ❌ ${row.downvote}`)
                      .setDescription(`\n\n**Hakemuksen lähettäjä:**\n<@${row.userId}>\n\n**OOC:**\n${row.ooc}\n\n**IC:**\n${row.ic}\n\n`)
                      .setColor('#1c33ff')
                      .setTimestamp()
                      .setFooter({
                        text: 'Lore',
                        iconURL: 'https://cdn.discordapp.com/attachments/1353381108963606629/1353842435578527795/PpvjEdL.png'
                      });
              
                    const allow = new ButtonBuilder().setCustomId('allow').setLabel('✅').setStyle(ButtonStyle.Primary);
                    const disallow = new ButtonBuilder().setCustomId('disallow').setLabel('❌').setStyle(ButtonStyle.Danger);
                    const disallowreason = new ButtonBuilder().setCustomId('disallowreason').setLabel('Hylkää hakemus syyllä ❌').setStyle(ButtonStyle.Secondary);  
                    const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(allow, disallow, disallowreason);
              
                    const cache = bot.client.channels.cache.get(config.APPROVAL) || await bot.client.channels.fetch(config.APPROVAL);
                    if (!cache || !(cache instanceof TextChannel)) {
                      return interaction.followUp({ content: 'Kanavaa ei löytynyt tai se ei ole tekstikanava', flags: MessageFlags.Ephemeral });
                    }
              
                    const msg = await cache.send({ embeds: [embed], components: [buttons] });
                    await db.query<RowDataPacket[]>(
                      'UPDATE lore_applications SET messageidentifier = ? WHERE messageidentifier = ?',
                      [msg.id, interaction.message.id]
                    );
              
                    await interaction.reply({ content: 'Äänestit hakemusta!', flags: MessageFlags.Ephemeral });
                    interaction.message.delete();
              
                  } else {
                    const originalEmbed = interaction.message.embeds[0];
                    const updatedEmbed = EmbedBuilder.from(originalEmbed);
              
                    const voterNames = await Promise.all(users.map(async (id: string) => {
                      try {
                        const user = await bot.client.users.fetch(id);
                        return `- ${user.username}`;
                      } catch {
                        return '- Tuntematon käyttäjä';
                      }
                    }));
              
                    updatedEmbed.setFields([
                      {
                        name: 'Äänet',
                        value: `${row.upvote + row.downvote + 1}`,
                        inline: true,
                      },
                      {
                        name: 'Äänestäneet',
                        value: voterNames.join('\n') || 'Ei vielä äänestäjiä',
                        inline: true,
                      }
                    ]);
              
                    await interaction.message.edit({ embeds: [updatedEmbed] });
                    await interaction.reply({ content: 'Äänestit hakemusta!', flags: MessageFlags.Ephemeral });
                  }
              
                } catch (error) {
                  console.error('Virhe upvoten käsittelyssä:', error);
                }
              }

              if (interaction.customId === 'downvote') {
                try {
                  const [app] = await db.query<RowDataPacket[]>('SELECT * FROM lore_applications WHERE messageidentifier = ?', [interaction.message.id]);
                  
                  if (app.length === 0) {
                    return interaction.reply({ content: 'Hakemusta ei ole olemassa!', flags: MessageFlags.Ephemeral });
                  }
            
                  const row = app[0];
                  const users = JSON.parse(row.reacted_users || '[]');
            
                  if (users.includes(interaction.user.id)) {
                    return interaction.reply({ content: 'Olet jo reagoinut tähän hakemukseen!', flags: MessageFlags.Ephemeral });
                  }
            
                  users.push(interaction.user.id);
            
                  await db.query<RowDataPacket[]>('UPDATE lore_applications SET downvote = ?, reacted_users = ? WHERE messageidentifier = ?', [row.downvote + 1, JSON.stringify(users), interaction.message.id]);
                  if (row.downvote + 1 >= config.VOTELIMIT) {
                    await db.query<RowDataPacket[]>('DELETE FROM lore_applications WHERE messageidentifier = ?', [interaction.message.id]);
            
                    const embed = new EmbedBuilder()
                      .setTitle(`Hakemus hylätty äänestyksen perusteella! \n\nHakemusessa äänestäneiden tulos - ✅ ${row.upvote} | ❌ ${row.downvote + 1}`)
                      .setDescription(`\n\n**Hakemuksen lähettäjä:**\n<@${row.userId}>\n\n**OOC:**\n${row.ooc}\n\n**IC:**\n${row.ic}\n\n`)
                      .setColor('#910101')
                      .setTimestamp()
                      .setFooter({ text: 'Lore Whitelist -System', iconURL: 'https://cdn.discordapp.com/attachments/1353381108963606629/1353842435578527795/PpvjEdL.png?ex=67e90e45&is=67e7bcc5&hm=4cca11353f3c01a467cd23a6c93e63be768e10cf8f94f4d3ee0ca3e785e4590b&' });
            
                    const embedUser = new EmbedBuilder()
                      .setTitle('Hakemuksesi on valitettavasti hylätty!')
                      .setDescription('\n\n Voit nyt tehdä uuden hakemuksen! \n\n - Ylläpito ja äänestäjät')
                      .setColor('#910101')
                      .setTimestamp()
                      .setFooter({ text: 'Lore Whitelist -System', iconURL: 'https://cdn.discordapp.com/attachments/1353381108963606629/1353842435578527795/PpvjEdL.png?ex=67e90e45&is=67e7bcc5&hm=4cca11353f3c01a467cd23a6c93e63be768e10cf8f94f4d3ee0ca3e785e4590b&' });
            
                    const user = await bot.client.users.fetch(row.userId);
                    try {
                      await user.send({ embeds: [embedUser] });
                    } catch (error) {

                    }
            
                    const cache = bot.client.channels.cache.get(config.ARCHIVES) || await bot.client.channels.fetch(config.ARCHIVES);
                    if (!cache || !(cache instanceof TextChannel)) {
                      return interaction.followUp({ content: 'Kanavaa ei löytynyt tai se ei ole tekstikanava', flags: MessageFlags.Ephemeral });
                    }
            
                    const msg = await cache.send({ embeds: [embed] });
                    await db.query<RowDataPacket[]>('UPDATE lore_applications SET messageidentifier = ? WHERE messageidentifier = ?', [msg.id, interaction.message.id]);
            
                    const originalEmbed = interaction.message.embeds[0];
                    const updatedEmbed = EmbedBuilder.from(originalEmbed);
            
                    const voterNames = await Promise.all(users.map(async (id: string) => {
                      try {
                        const user = await bot.client.users.fetch(id);
                        return `- ${user.username}`;
                      } catch {
                        return '- Tuntematon käyttäjä';
                      }
                    }));
            
                    updatedEmbed.setFields([
                      {
                        name: 'Äänet',
                        value: `${row.upvote + row.downvote + 1}`,
                        inline: true,
                      },
                      {
                        name: 'Äänestäneet',
                        value: voterNames.join('\n') || 'Ei vielä äänestäjiä',
                        inline: true,
                      }
                    ]);
            
                    await interaction.message.edit({ embeds: [updatedEmbed] });
            
                    await interaction.reply({ content: 'Äänestit hakemusta!', flags: MessageFlags.Ephemeral });
                    interaction.message.delete();
            
                  } else {
                    const originalEmbed = interaction.message.embeds[0];
                    const updatedEmbed = EmbedBuilder.from(originalEmbed);
            
                    const voterNames = await Promise.all(users.map(async (id: string) => {
                      try {
                        const user = await bot.client.users.fetch(id);
                        return `- ${user.username}`;
                      } catch {
                        return '- Tuntematon käyttäjä';
                      }
                    }));
            
                    updatedEmbed.setFields([
                      {
                        name: 'Äänet',
                        value: `${row.upvote + row.downvote + 1}`,
                        inline: true,
                      },
                      {
                        name: 'Äänestäneet',
                        value: voterNames.join('\n') || 'Ei vielä äänestäjiä',
                        inline: true,
                      }
                    ]);
            
                    await interaction.message.edit({ embeds: [updatedEmbed] });
            
                    await interaction.reply({ content: 'Äänestit hakemusta!', flags: MessageFlags.Ephemeral });
                  }
            
                } catch (error) {
                  console.error('Virhe downvoten käsittelyssä:', error);
                }
              }
    

/*---------------------------------------------------------------------------*/ 
                                 /* WHITELIST UP AND DOWN VOTES */
/*---------------------------------------------------------------------------*/ 
              if (interaction.customId === 'allow') {
                const [data] = await db.query<RowDataPacket[]>('SELECT * FROM lore_applications WHERE messageidentifier = ?', [interaction.message.id]);
                if (!data.length || !data[0].messageidentifier) {
                  return interaction.reply({content: 'Hakemusta ei löytynyt, hakemus voi olla käsitelty tai käsittelyssä on ongelma!', flags: MessageFlags.Ephemeral});
                }
                const getApp = data[0];
                const embed = new EmbedBuilder()
                  .setTitle(`Hakemus hyväksytty ylläpidon kautta! \n\nHakemusessa äänestäneiden tulos - ✅ ${data[0].upvote} | ❌ ${data[0].downvote}`)
                  .setDescription(`\n \n**Hyväksyjä:** <@${interaction.user.id}> \n\n**Hakemuksen lähettäjä:**\n<@${getApp.userId}>\n\n**OOC:**\n${getApp.ooc}\n\n**IC:**\n${getApp.ic}\n\n`)
                  .setColor('#1c33ff')
                  .setTimestamp()
                  .setFooter({text: 'Lore Whitelist -System', iconURL: 'https://cdn.discordapp.com/attachments/1353381108963606629/1353842435578527795/PpvjEdL.png?ex=67e90e45&is=67e7bcc5&hm=4cca11353f3c01a467cd23a6c93e63be768e10cf8f94f4d3ee0ca3e785e4590b&'})

                  const embedUser = new EmbedBuilder()
                    .setTitle('Hakemuksesi on hyväksytty!')
                    .setDescription(`Whitelist hakemuksesi on hyväksytty! Onnistuneen hakemusen myötä sinulle on avattu haastattelu-kanavat joissa sinulle ilmoitetaan haastatteluista.`)
                    .setColor('#00a814')
                    .setTimestamp()
                    .setFooter({text: 'Lore Whitelist -System', iconURL: 'https://cdn.discordapp.com/attachments/1353381108963606629/1353842435578527795/PpvjEdL.png?ex=67e90e45&is=67e7bcc5&hm=4cca11353f3c01a467cd23a6c93e63be768e10cf8f94f4d3ee0ca3e785e4590b&'})
                    const user = await bot.client.users.fetch(getApp.userId);
                    const guild = await bot.client.guilds.fetch(config.GUILD);
                    const member = await guild.members.fetch(user);
                    const role = await guild.roles.fetch(config.WLROLE);
                    //const memberrole = await guild.roles.fetch(config.REACTIONROLE);
                    if (!role) {
                      return interaction.reply({content: 'Ongelma, Whitelist roolia ei löytynyt!', flags: MessageFlags.Ephemeral});
                    }
                    //if (!memberrole) {
                      //return interaction.reply({content: 'Ongelma, member roolia ei löytynyt!', flags: MessageFlags.Ephemeral});
                    //}
                    const cache = bot.client.channels.cache.get(config.ARCHIVES) || await bot.client.channels.fetch(config.ARCHIVES);
                    if (!cache || !(cache instanceof TextChannel)) {
                      return interaction.followUp({ content: 'Kanavaa ei löytynyt tai se ei ole tekstikanava', flags: MessageFlags.Ephemeral });
                    }
                    await member.roles.add(role);
                    try {
                      await user.send({embeds: [embedUser]});
                    } catch (error) {

                    }
                    await cache.send({embeds: [embed]});
                    interaction.reply({content: 'Hyväksyit hakemuksen!', flags: MessageFlags.Ephemeral});
                    await interaction.message.delete();
                    await db.query<RowDataPacket[]>('DELETE FROM lore_applications WHERE messageidentifier = ?', [interaction.message.id]);
              }

              if (interaction.customId === 'disallow') {
                await interaction.deferReply({flags: MessageFlags.Ephemeral})
                const [data] = await db.query<RowDataPacket[]>('SELECT * FROM lore_applications WHERE messageidentifier = ?', [interaction.message.id]);
                if (!data.length || !data[0].messageidentifier) {
                  return await interaction.editReply({content: 'Hakemusta ei löytynyt, hakemus voi olla käsitelty tai käsittelyssä on ongelma!', flags: MessageFlags.Ephemeral});
                }
                const getApp = data[0];
                const embed = new EmbedBuilder()
                  .setTitle(`Hakemus hylätty ylläpidon kautta! \n\nHakemuksessa äänestäneiden tulos - ✅ ${data[0].upvote} | ❌ ${data[0].downvote}`)
                  .setDescription(`\n \n**Hylkääjä:** <@${interaction.user.id}> \n\n**Hakemuksen lähettäjä:**\n<@${getApp.userId}>\n\n**OOC:**\n${getApp.ooc}\n\n**IC:**\n${getApp.ic}\n\n`)
                  .setColor('#910101')
                  .setTimestamp()
                  .setFooter({text: 'Lore Whitelist -System', iconURL: 'https://cdn.discordapp.com/attachments/1353381108963606629/1353842435578527795/PpvjEdL.png?ex=67e90e45&is=67e7bcc5&hm=4cca11353f3c01a467cd23a6c93e63be768e10cf8f94f4d3ee0ca3e785e4590b&'})

                  const embedUser = new EmbedBuilder()
                  .setTitle('Hakemuksesi on valitettavasti hylätty!')
                  .setDescription('\n\n Voit nyt tehdä uuden hakemuksen! \n\n - Ylläpito ja äänestäjät')
                  .setColor('#910101')
                  .setTimestamp()
                  .setFooter({ text: 'Lore Whitelist -System', iconURL: 'https://cdn.discordapp.com/attachments/1353381108963606629/1353842435578527795/PpvjEdL.png?ex=67e90e45&is=67e7bcc5&hm=4cca11353f3c01a467cd23a6c93e63be768e10cf8f94f4d3ee0ca3e785e4590b&' });
                  const user = await bot.client.users.fetch(getApp.userId);
                  const guild = await bot.client.guilds.fetch(config.GUILD);
                  const member = await guild.members.fetch(user);
                  const cache = bot.client.channels.cache.get(config.ARCHIVES) || await bot.client.channels.fetch(config.ARCHIVES);
                  if (!cache || !(cache instanceof TextChannel)) {
                    return await interaction.editReply({ content: 'Kanavaa ei löytynyt tai se ei ole tekstikanava', flags: MessageFlags.Ephemeral });
                  }
                  try {
                    await user.send({embeds: [embedUser]});
                  } catch (error) {

                  }
                  await cache.send({embeds: [embed]});
                  await interaction.editReply({content: 'Hylkäsit hakemuksen!', flags: MessageFlags.Ephemeral});
                  await interaction.message.delete();
                  await db.query<RowDataPacket[]>('DELETE FROM lore_applications WHERE messageidentifier = ?', [interaction.message.id]);
              }

              if (interaction.customId === 'disallowreason') {
                const modal = new ModalBuilder().setCustomId('deny-header').setTitle('Hakemuksen hylkäys');
                  modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder().setCustomId('deny-reason').setLabel('Hylkäyksen syy: ').setStyle(TextInputStyle.Paragraph).setMaxLength(300)));
                  await interaction.showModal(modal);
              }
    
    /*---------------------------------------------------------------------------*/ 
                                 /* REACTION ROLES */
    /*---------------------------------------------------------------------------*/ 
              if (interaction.customId === 'reactionrole') {
                const member = await interaction.guild.members.fetch(interaction.user.id);
      
                if (!member.roles.cache.has(config.REACTIONROLE)) {
                  await member.roles.add(config.REACTIONROLE);
                  return interaction.reply({ content: `Sinulle lisättiin rooli <@&${config.REACTIONROLE}>!`, flags: MessageFlags.Ephemeral});
                }
                await member.roles.remove(config.REACTIONROLE);
                return interaction.reply({ content: `Sinulta poistettiin rooli <@&${config.REACTIONROLE}>!`, flags: MessageFlags.Ephemeral});
              }
            }
    
    /*---------------------------------------------------------------------------*/ 
                                 /* COMMAND HANDLER */
    /*---------------------------------------------------------------------------*/ 
    
            const command = bot.commands.get(interaction.commandName);
            if (!command) {
              //interaction.reply({content: 'Komentoa ei löytynyt!', flags: MessageFlags.Ephemeral});
              return;
            }
            try {
              await command.execute(interaction)
            } catch (error) {
              console.error('Komennon suorittaminen epäonnistui!', error);
              await interaction.reply({content: 'Virhe komennon suorittamisessa', flags: MessageFlags.Ephemeral});
            }
        }