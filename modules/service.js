//Récupération des fonctions pour créer des boutons
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
//Récup du logger
const logger = require('./../modules/logger');
//Récup du créateur d'embed
const emb = require('./../modules/embeds');
//Récup des requêtes SQL
const sql = require('./../sql/radios');

//Boutons de regen radios
const radioBtns = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setLabel('Régénérer la radio LSMS').setCustomId('serviceRegenLSMS').setStyle(ButtonStyle.Danger).setEmoji('1124910934922625104'),
    new ButtonBuilder().setLabel('Régénérer la radio BCMS').setCustomId('serviceRegenBCMS').setStyle(ButtonStyle.Success).setEmoji('1124910870695256106'),
    new ButtonBuilder().setLabel('Régénérer la radio Event').setCustomId('serviceRegenEvent').setStyle(ButtonStyle.Secondary).setEmoji('1121278617960329257')
);
//Boutons de gestion du service
const btns = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setLabel('Service').setCustomId('serviceSwitch').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setLabel('Dispatch').setCustomId('serviceDispatch').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setLabel('Off radio').setCustomId('serviceSwitchOff').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('serviceManage').setStyle(ButtonStyle.Secondary).setEmoji('1128896218672681090')
);

module.exports = {
    start: (client) => {
        //Boucle infinie pour auto-recréation en cas de supression
        setInterval(async () => {
            //Récupération du serveur Discord LSMS
            const guild = client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID);
            //Récupération du channel de service
            const chan = guild.channels.cache.get(process.env.IRIS_SERVICE_CHANNEL_ID);
            //Refresh de tous les messages du channel et check si les messages sont bien présents
            const messages = await chan.messages.fetch();
            const found = await getMessages(messages, client);
            //Si pas présent recréation du message
            if(!found) {
                //Base de l'embed
                const serviceEmb = emb.generate(null, null, `**Pour indiquer une prise/fin de service - Appuyez sur 🔴 \n\nPour prendre le dispatch - Appuyez sur 🔵 \n\nPour indiquer un off radio - Appuyez sur ⚫**\n\n\u200b`, `#FF0000`, `https://cdn.discordapp.com/attachments/1083724872045297734/1124914370217005127/LSMS.png`, null, `Gestion du service`, `https://cdn.discordapp.com/attachments/1083724872045297734/1124914370217005127/LSMS.png`, null, null, null, false);
                //Radios
                var freqLSMS = await sql.getRadio('lsms');
                freqLSMS = freqLSMS[0].lsms;
                var freqFDO = await sql.getRadio('fdo');
                freqFDO = freqFDO[0].fdo;
                serviceEmb.addFields([
                    {
                        name: `💉 Radio LSMS`,
                        value: freqLSMS,
                        inline: true
                    },
                    {
                        name: `👮 Radio FDO`,
                        value: freqFDO,
                        inline: true
                    }
                ]);
                //Check de si les radios optionnelles doivent être affichées
                var genBCMS = await sql.getRadio('bcmsgen');
                genBCMS = genBCMS[0].bcmsgen;
                var genEvent = await sql.getRadio('eventgen');
                genEvent = genEvent[0].eventgen;
                var freqBCMS = await sql.getRadio('bcms');
                freqBCMS = freqBCMS[0].bcms;
                var freqEvent = await sql.getRadio('event');
                freqEvent = freqEvent[0].event;
                if(genBCMS == '1' && genEvent == '0') {
                    serviceEmb.addFields([
                        {
                            name: `\u200b`,
                            value: `\u200b`,
                            inline: true
                        },
                        {
                            name: `<:bcms:1128889752284844124> Radio BCMS`,
                            value: freqBCMS,
                            inline: true
                        },
                    ]);
                } else if(genBCMS == '0' && genEvent == '1') {
                    serviceEmb.addFields([
                        {
                            name: `\u200b`,
                            value: `\u200b`,
                            inline: true
                        },
                        {
                            name: `🏆 Radio Event`,
                            value: freqEvent,
                            inline: true
                        },
                    ]);
                } else if(genBCMS == '1' && genEvent == '1') {
                    serviceEmb.addFields([
                        {
                            name: `\u200b`,
                            value: `\u200b`,
                            inline: true
                        },
                        {
                            name: `<:bcms:1128889752284844124> Radio BCMS`,
                            value: freqBCMS,
                            inline: true
                        },
                        {
                            name: `🏆 Radio Event`,
                            value: freqEvent,
                            inline: true
                        },
                        {
                            name: `\u200b`,
                            value: `\u200b`,
                            inline: true
                        }
                    ]);
                }
                //Envois
                await chan.send({ embeds: [serviceEmb], components: [radioBtns, btns] });
            }
        }, 1000);
    },
    resetRadios: async (client, interaction) => {
        //Récupération du serveur Discord LSMS
        const guild = client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID);
        //Récupération du channel de service
        const chan = guild.channels.cache.get(process.env.IRIS_SERVICE_CHANNEL_ID);
        //Refresh de tous les messages du channel et check si message bien présent
        const messages = await chan.messages.fetch();
        const msg = await getMessages(messages, client);
        if(msg != false) {
            //Reset de l'embed
            const serviceEmb = emb.generate(null, null, `**Pour indiquer une prise/fin de service - Appuyez sur 🔴 \n\nPour prendre le dispatch - Appuyez sur 🔵 \n\nPour indiquer un off radio - Appuyez sur ⚫**\n\n\u200b`, `#FF0000`, `https://cdn.discordapp.com/attachments/1083724872045297734/1124914370217005127/LSMS.png`, null, `Gestion du service`, `https://cdn.discordapp.com/attachments/1083724872045297734/1124914370217005127/LSMS.png`, null, null, null, false);
            serviceEmb.addFields([
                {
                    name: `💉 Radio LSMS`,
                    value: `0.0`,
                    inline: true
                },
                {
                    name: `👮 Radio FDO`,
                    value: `0.0`,
                    inline: true
                }
            ]);
            //Reset des radios en DB
            await sql.setRadio('lsms', '0.0');
            await sql.setRadio('bcms', '0.0');
            await sql.setRadio('bcmsgen', '0');
            await sql.setRadio('event', '0.0');
            await sql.setRadio('eventgen', '0');
            //Envois du message
            await msg.edit({ embeds: [serviceEmb], components: [radioBtns, btns] });
            //Confirmation du succès de l'opération à Discord
            await interaction.deferUpdate();
        }
    }
}

//Fonction séparée pour attendre la fin du check des messages un par un
function getMessages(messages, client) {
    return new Promise((resolve, reject) => {
        messages.forEach(msg => {
            if(msg.author.username == client.user.username && msg.embeds != null) {
                if(msg.embeds[0].author.name == 'Gestion du service') {
                    resolve(msg);
                    return;
                }
            }
        });
        resolve(false);
    });
}