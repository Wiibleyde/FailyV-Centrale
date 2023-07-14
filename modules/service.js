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
    new ButtonBuilder().setLabel('LSMS').setCustomId('serviceRegenLSMS').setStyle(ButtonStyle.Danger).setEmoji('1124910934922625104').setDisabled(false),
    new ButtonBuilder().setLabel('FDO').setCustomId('serviceRegenFDO').setStyle(ButtonStyle.Primary).setEmoji('1124920279559327824').setDisabled(false),
    new ButtonBuilder().setLabel('BCMS').setCustomId('serviceRegenBCMS').setStyle(ButtonStyle.Success).setEmoji('1124910870695256106').setDisabled(false),
    new ButtonBuilder().setLabel('Event').setCustomId('serviceRegenEvent').setStyle(ButtonStyle.Secondary).setEmoji('1121278617960329257').setDisabled(false),
    new ButtonBuilder().setCustomId('serviceRadioReset').setStyle(ButtonStyle.Secondary).setEmoji('1128896218672681090')
);
//Boutons de gestion du service
const btns = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setLabel('Service').setCustomId('serviceSwitch').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setLabel('Dispatch').setCustomId('serviceDispatch').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setLabel('Aïe la tête').setCustomId('serviceSwitchOff').setStyle(ButtonStyle.Secondary),
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
            //Récupération du channel des radios
            const radioChan = guild.channels.cache.get(process.env.IRIS_RADIO_CHANNEL_ID);
            //Refresh de tous les messages du channel et check si les messages sont bien présents
            const messages = await chan.messages.fetch();
            const found = await getMessages(messages, client);
            const radioMessages = await radioChan.messages.fetch();
            const radioFound = await getMessages(radioMessages, client);
            //Si pas présent recréation du message
            if(!found) {
                //Base de l'embed
                const serviceEmb = emb.generate(null, null, `**Pour indiquer une prise/fin de service - Appuyez sur 🔴 \n\nPour prendre/relâcher le dispatch - Appuyez sur 🔵 \n\nPour indiquer un mal de tête - Appuyez sur ⚫**`, `#FF0000`, process.env.LSMS_LOGO_V2, null, `Gestion du service`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).icon}.webp`, null, null, null, false);
                //Envois
                await chan.send({ embeds: [serviceEmb], components: [btns] });
            }
            if(!radioFound) {
                //Base de l'embed
                const radioEmb = emb.generate(null, null, null, `#FF0000`, process.env.LSMS_LOGO_V2, null, `Gestion des radios`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).icon}.webp`, null, null, null, false);
                //Radios
                var freqLSMS = await sql.getRadio('lsms');
                freqLSMS = freqLSMS[0].radiofreq;
                var freqFDO = await sql.getRadio('fdo');
                freqFDO = freqFDO[0].radiofreq;
                radioEmb.addFields([
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
                var genBCMS = await sql.isRadioDisplayed('bcms');
                genBCMS = genBCMS[0].displayed;
                var genEvent = await sql.isRadioDisplayed('event');
                genEvent = genEvent[0].displayed;
                var freqBCMS = await sql.getRadio('bcms');
                freqBCMS = freqBCMS[0].radiofreq;
                var freqEvent = await sql.getRadio('event');
                freqEvent = freqEvent[0].radiofreq;
                if(genBCMS == '1' && genEvent == '0') {
                    radioEmb.addFields([
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
                    radioEmb.addFields([
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
                    radioEmb.addFields([
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
                await radioChan.send({ embeds: [radioEmb], components: [radioBtns] });
            }
        }, 1000);
    },
    resetRadios: async (radio, client, interaction) => {
        //Récupération du serveur Discord LSMS
        const guild = client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID);
        //Récupération du channel des radios
        const radioChan = guild.channels.cache.get(process.env.IRIS_RADIO_CHANNEL_ID);
        //Refresh de tous les messages du channel et check si message bien présent
        const messages = await radioChan.messages.fetch();
        const msg = await getMessages(messages, client);
        if(msg != false) {
            //Reset de l'embed
            const radioEmb = emb.generate(null, null, null, `#FF0000`, process.env.LSMS_LOGO_V2, null, `Gestion des radios`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).icon}.webp`, null, null, null, false);
            radioEmb.addFields([
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
            await sql.updatedRadioDisplay('bcms', '0');
            await sql.setRadio('event', '0.0');
            await sql.updatedRadioDisplay('event', '0');
            //Envois du message
            await msg.edit({ embeds: [radioEmb], components: [radioBtns] });
            await interaction.deferUpdate();
        }
    },
    
    //Fonction séparée pour attendre la fin du check des messages un par un
    getMessages: (messages, client) => {
        return getMessages(messages, client);
    }
}

//Fonction séparée pour attendre la fin du check des messages un par un
function getMessages(messages, client) {
    return new Promise((resolve, reject) => {
        messages.forEach(msg => {
            if(msg.author.username == client.user.username && msg.embeds[0] != null) {
                if(msg.embeds[0].author.name == 'Gestion du service' || msg.embeds[0].author.name == 'Gestion des radios') {
                    resolve(msg);
                    return;
                }
            }
        });
        resolve(false);
    });
}