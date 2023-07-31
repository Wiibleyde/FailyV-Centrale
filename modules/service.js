//Récupération des fonctions pour créer des boutons
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, WebhookClient } = require('discord.js');
//Récup du logger
const logger = require('./logger');
//Récup du créateur d'embed
const emb = require('./embeds');
//Récup des requêtes SQL
const sqlRadio = require('./../sql/radio/radios');
const sqlAgenda = require('./../sql/agenda/agenda');
const sqlFollow = require('./../sql/suivi/suivi');
const sqlBeds = require('./../sql/lit/lit');
//Récup des réactions
const btnCreator = require('./btnCreator');

const follow = require('./suiviMessages');

const sql = require('./../sql/config/config');

const ws = require('./commonRadioServer');

//Fonction pour attendre
const wait = require('node:timers/promises').setTimeout;

//Boutons de regen radios
const radioBtns = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setLabel('LSMS').setCustomId('regenLSMS').setStyle(ButtonStyle.Danger).setEmoji('1133116950357213355').setDisabled(false),
    new ButtonBuilder().setLabel('FDO').setCustomId('regenFDO').setStyle(ButtonStyle.Primary).setEmoji('1133117105848471552').setDisabled(false),
    new ButtonBuilder().setLabel('BCMS').setCustomId('regenBCMS').setStyle(ButtonStyle.Success).setEmoji('1124910870695256106').setDisabled(false),
    new ButtonBuilder().setLabel('Event').setCustomId('regenEvent').setStyle(ButtonStyle.Secondary).setEmoji('1121278617960329257').setDisabled(false),
    new ButtonBuilder().setCustomId('serviceRadioReset').setStyle(ButtonStyle.Secondary).setEmoji('➖')
);
//Boutons de gestion du service
const btns = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setLabel('Service').setCustomId('serviceSwitch').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setLabel('Dispatch').setCustomId('serviceDispatch').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setLabel('Aïe la tête').setCustomId('serviceSwitchOff').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('serviceManage').setStyle(ButtonStyle.Secondary).setEmoji('➖')
);

let gen = false;

module.exports = {
    start: (client) => {
        //Boucle infinie pour auto-recréation en cas de supression
        setInterval(async () => {
            //Récupération des channels
            let IRIS_SERVICE_CHANNEL_ID = await sql.getChannel('IRIS_SERVICE_CHANNEL_ID');
            if (IRIS_SERVICE_CHANNEL_ID[0] == undefined) {
                IRIS_SERVICE_CHANNEL_ID = null;
                return;
            } else {
                IRIS_SERVICE_CHANNEL_ID = IRIS_SERVICE_CHANNEL_ID[0].id;
            }
            let IRIS_RADIO_CHANNEL_ID = await sql.getChannel('IRIS_RADIO_CHANNEL_ID');
            if (IRIS_RADIO_CHANNEL_ID[0] == undefined) {
                IRIS_RADIO_CHANNEL_ID = null;
                return;
            } else {
                IRIS_RADIO_CHANNEL_ID = IRIS_RADIO_CHANNEL_ID[0].id;
            }
            //Récupération de l'image des lits
            let bedsImg;
            client.guilds.cache.get(process.env.IRIS_DEBUG_GUILD_ID).channels.cache.get(process.env.IRIS_BEDS_CHANNEL_ID).messages.fetch({ limit: 1 }).then(messages => {
                if(messages.first() != null) {
                    messages.first().attachments.map(bedImg => bedsImg = bedImg.attachment);
                }
            });
            //Récupération du serveur Discord LSMS
            const guild = client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID);
            //Refresh de tous les messages du channel et check si les messages sont bien présents (service)
            const serviceChan = guild.channels.cache.get(IRIS_SERVICE_CHANNEL_ID);
            const messages = await serviceChan.messages.fetch();
            const found = await getServiceMessages(messages, client);
            //Refresh de tous les messages du channel et check si les messages sont bien présents (radios)
            const radioChan = guild.channels.cache.get(IRIS_RADIO_CHANNEL_ID);
            const radioMessages = await radioChan.messages.fetch();
            const radioFound = await getCentraleMessages(radioMessages, client);
            //Refresh de tous les messages du channel et check si les messages sont bien présents (agenda)
            const agendaChanId = await sqlAgenda.getAgendaChannelId();
            let agendaChan;
            let agendaMessages;
            let agendaMessagesCount;
            if(agendaChanId[0] != null) {
                agendaChan = guild.channels.cache.get(agendaChanId[0].id);
                agendaMessages = await agendaChan.messages.fetch();
                agendaMessagesCount = await getIrisChannelMessages(agendaMessages);
            } else {
                agendaMessagesCount = 0;
            }
            const agendaWaiting = await sqlAgenda.getAllWaiting();
            //Refresh de tous les messages du channel et check si les messages sont bien présents (suivi)
            const followChanId = await sqlFollow.getFollowChannelId();
            let followChan;
            let followMessages;
            let followMessagesCount;
            if(followChanId[0] != null) {
                followChan = guild.channels.cache.get(followChanId[0].id);
                followMessages = await followChan.messages.fetch();
                followMessagesCount = await getIrisChannelMessages(followMessages);
            } else {
                followMessagesCount = 9;
            }
            //Si pas présent recréation du message
            if(!found) {
                if(!gen) {
                    gen = true;
                    //Base de l'embed
                    const serviceEmb = emb.generate(null, null, `**Pour indiquer une prise/fin de service - Appuyez sur 🔴 \n\nPour prendre/relâcher le dispatch - Appuyez sur 🔵 \n\nPour indiquer un mal de tête - Appuyez sur ⚫**`, process.env.LSMS_COLORCODE, process.env.LSMS_LOGO_V2, null, `Gestion du service`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).icon}.webp`, null, null, null, false);
                    //Envois
                    await serviceChan.send({ embeds: [serviceEmb], components: [btns] });
                    gen = false;
                }
            }
            if(radioFound != 2) {
                if(!gen) {
                    gen = true;
                    ws.askRadioInfo('lsms-lspd-lscs');
                    ws.setRequested(true);
                    while(ws.isRequested()) {
                        wait(1);
                    }
                    ws.askRadioInfo('lsms-bcms');
                    ws.setRequested(true);
                    while(ws.isRequested()) {
                        wait(1);
                    }
                    //Base de l'embed
                    const radioEmb = emb.generate(null, null, `**Note: Ctrl+R si vous ne voyez pas les radios actualisées !**\n\u200b`, process.env.LSMS_COLORCODE, process.env.LSMS_LOGO_V2, null, `Gestion des radios`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).icon}.webp`, null, null, null, false);
                    //Radios
                    var freqLSMS = await sqlRadio.getRadio('lsms');
                    freqLSMS = freqLSMS[0].radiofreq;
                    var freqFDO = await sqlRadio.getRadio('fdo');
                    freqFDO = freqFDO[0].radiofreq;
                    radioEmb.addFields([
                        {
                            name: `<:IrisLSMS:1133116950357213355> Radio LSMS`,
                            value: freqLSMS,
                            inline: true
                        },
                        {
                            name: `<:IrisLSPDCS:1133117105848471552> Radio FDO`,
                            value: freqFDO,
                            inline: true
                        }
                    ]);
                    //Check de si les radios optionnelles doivent être affichées
                    var genBCMS = await sqlRadio.isRadioDisplayed('bcms');
                    genBCMS = genBCMS[0].displayed;
                    var genEvent = await sqlRadio.isRadioDisplayed('event');
                    genEvent = genEvent[0].displayed;
                    var freqBCMS = await sqlRadio.getRadio('bcms');
                    freqBCMS = freqBCMS[0].radiofreq;
                    var freqEvent = await sqlRadio.getRadio('event');
                    freqEvent = freqEvent[0].radiofreq;
                    if(genBCMS == '1' && genEvent == '0') {
                        radioEmb.addFields([
                            {
                                name: `\u200b`,
                                value: `\u200b`,
                                inline: true
                            },
                            {
                                name: `<:IrisBCMS:1133150717125853297> Radio BCMS`,
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
                                name: `<:IrisEvent:1133705259596910624> Radio Event`,
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
                                name: `<:IrisBCMS:1133150717125853297> Radio BCMS`,
                                value: freqBCMS,
                                inline: true
                            },
                            {
                                name: `<:IrisEvent:1133705259596910624> Radio Event`,
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
                    let letters = await sqlBeds.getLetters();
                    //Envois
                    if(radioFound == 0) {
                        const radioMsg = await radioChan.send({ embeds: [radioEmb], components: [radioBtns] });
                        sendBedsImage(letters, radioChan, bedsImg);
                        await sqlRadio.clearRadioMessageId();
                        await sqlRadio.setRadioMessageId(radioMsg.id);
                    }
                    if(radioFound.embeds != null) {
                        if(radioFound.embeds[0].url != null) {
                            if(radioFound.embeds[0].url.includes('/lit.png')) {
                                await radioFound.delete();
                                const radioMsg = await radioChan.send({ embeds: [radioEmb], components: [radioBtns] });
                                sendBedsImage(letters, radioChan, bedsImg);
                                await sqlRadio.clearRadioMessageId();
                                await sqlRadio.setRadioMessageId(radioMsg.id);
                            }
                        }
                        if(radioFound.embeds[0].author != null) {
                            if(radioFound.embeds[0].author.name == 'Gestion des radios') {
                                sendBedsImage(letters, radioChan, bedsImg);
                            }
                        }
                    }    
                }
            }
            if(agendaMessagesCount != agendaWaiting.length) {
                if(!gen) {
                    gen = true;
                    agendaMessages.forEach(async msg => {
                        if(msg.author.id == process.env.IRIS_DISCORD_ID) {
                            await msg.delete();
                        }
                    });
                    for(i=0;i<agendaWaiting.length;i++) {
                        const buttons = new ActionRowBuilder().addComponents(
                            new ButtonBuilder().setLabel(`Définir la date`).setCustomId(`agEventDefine`).setStyle(ButtonStyle.Success).setEmoji(`📆`).setDisabled(false),
                            new ButtonBuilder().setLabel(`Responsables contactés`).setCustomId(`agRespContact`).setStyle(ButtonStyle.Primary).setEmoji(`📱`).setDisabled(false),
                            new ButtonBuilder().setLabel(`Supprimer`).setCustomId(`agDelete`).setStyle(ButtonStyle.Danger).setEmoji(`896393106633687040`).setDisabled(false)
                        );
                
                        const date = new Date(agendaWaiting[i].date);
                        const year = date.getFullYear();
                        let month = date.getMonth() + 1;
                        if (month < 10) month = '0' + month;
                        let day = date.getDate();
                        if (day < 10) day = '0' + day;
                        const formatedDate = day + '/' + month + '/' + year;
    
                        let service;
                        if(agendaWaiting[i].by == 'LSMS') {
                            service = '<:IrisLSMS:1133116950357213355> LSMS';
                        } else {
                            service = '<:IrisBCMS:1133150717125853297> BCMS';
                        }
                        
                        let confi;
                        if(agendaWaiting[i].confidentiality == '1') {
                            confi = `Décès publique`;
                        } else {
                            confi = `Décès privé`;
                        }
                        
                        let don;
                        if(agendaWaiting[i].donor == '1') {
                            don = 'Oui';
                        } else {
                            don = 'Non';
                        }
    
                        const agendaEmbed = emb.generate(null, null, null, `#000001`, process.env.LSMS_DELTA_LOGO, null, `Gestion décès`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${guild.icon}.webp`, null, agendaWaiting[i].writter, null, false);
                        agendaEmbed.addFields(
                            {
                                name: `**Identité**`,
                                value: agendaWaiting[i].name,
                                inline: true
                            },
                            {
                                name: `**Date du décès**`,
                                value: formatedDate,
                                inline: true
                            },
                            {
                                name: `**Traité par**`,
                                value: service,
                                inline: true
                            },
                            {
                                name: `**Personnes responsables**`,
                                value: agendaWaiting[i].responsibles,
                                inline: false
                            },
                            {
                                name: `**Personnes autorisées**`,
                                value: agendaWaiting[i].allowed,
                                inline: false
                            },
                            {
                                name: `**Confidentialité**`,
                                value: confi,
                                inline: true
                            },
                            {
                                name: `**Donneur·se**`,
                                value: don,
                                inline: true
                            },
                            {
                                name: `**Traitement**`,
                                value: agendaWaiting[i].management,
                                inline: false
                            },
                        );
                        if(agendaWaiting[i].other != null) {
                            agendaEmbed.addFields(
                                {
                                    name: `**Infos complémentaires**`,
                                    value: agendaWaiting[i].other,
                                    inline: false
                                }
                            );
                        }
                        if(agendaWaiting[i].contact != null) {
                            agendaEmbed.addFields(
                                {
                                    name: `**Responsables contactés**`,
                                    value: agendaWaiting[i].contact,
                                    inline: false
                                }
                            );
                        }
                        const newAgendaMsg = await agendaChan.send({ embeds: [agendaEmbed], components: [buttons] });
                        await sqlAgenda.updateMessageId(agendaWaiting[i].agendaID, newAgendaMsg.id);
                    }
                    gen = false;
                }
            }
            if(followMessagesCount != 9/*10*/) {
                if(!gen) {
                    gen = true;
                    await follow.regen(client);
                    gen = false;
                }
            }
        }, 1000);
    },
    setGen: (state) => {
        gen = state;
    },
    isGen: () => {
        return gen;
    },
    resetRadios: async (client, freqLSMS, freqFDO, interaction) => {
        //Récupération du serveur Discord LSMS
        const guild = client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID);
        //Récupération du channel des radios
        const radioChan = guild.channels.cache.get(IRIS_RADIO_CHANNEL_ID);
        //Refresh de tous les messages du channel et check si message bien présent
        const radioMessageId = await sqlRadio.getRadioMessageId();
        const msg = await radioChan.messages.fetch(radioMessageId[0].id);
        if(msg != false) {
            //Reset de l'embed
            const radioEmb = emb.generate(null, null, `**Note: Ctrl+R si vous ne voyez pas les radios actualisées !**\n\u200b`, process.env.LSMS_COLORCODE, process.env.LSMS_LOGO_V2, null, `Gestion des radios`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).icon}.webp`, null, null, null, false);
            radioEmb.addFields([
                {
                    name: `<:IrisLSMS:1133116950357213355> Radio LSMS`,
                    value: freqLSMS,
                    inline: true
                },
                {
                    name: `<:IrisLSPDCS:1133117105848471552> Radio FDO`,
                    value: freqFDO,
                    inline: true
                }
            ]);
            //Reset des radios en DB
            await sqlRadio.setRadio('lsms', freqLSMS);
            await sqlRadio.setRadio('fdo', freqFDO);
            await sqlRadio.setRadio('bcms', '0.0');
            await sqlRadio.updatedRadioDisplay('bcms', '0');
            await sqlRadio.setRadio('event', '0.0');
            await sqlRadio.updatedRadioDisplay('event', '0');
            //Envois du message
            await msg.edit({ embeds: [radioEmb], components: [radioBtns] });
            if(interaction != null) {
                await interaction.deferUpdate();
            }
        }
    },
    resetSpecificRadio: async (client, interaction, radio) => {
        //Récupération du serveur Discord LSMS
        const guild = client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID);
        //Récupération du channel des radios
        const radioChan = guild.channels.cache.get(IRIS_RADIO_CHANNEL_ID);
        //Refresh de tous les messages du channel et check si message bien présent
        const radioMessageId = sqlRadio.getRadioMessageId();
        const msg = radioChan.messages.fetch(radioMessageId[0].id);
        var freqLSMS = await sqlRadio.getRadio('lsms');
        freqLSMS = freqLSMS[0].radiofreq;
        var freqFDO = await sqlRadio.getRadio('fdo');
        freqFDO = freqFDO[0].radiofreq;
        var freqBCMS = await sqlRadio.getRadio('bcms');
        freqBCMS = freqBCMS[0].radiofreq;
        var freqEvent = await sqlRadio.getRadio('event');
        freqEvent = freqEvent[0].radiofreq;
        if(msg) {
            //Reset de l'embed
            const newRadioEmb = emb.generate(null, null, `**Note: Ctrl+R si vous ne voyez pas les radios actualisées !**\n\u200b`, process.env.LSMS_COLORCODE, process.env.LSMS_LOGO_V2, null, `Gestion des radios`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).icon}.webp`, null, null, null, false);
            newRadioEmb.addFields([
                {
                    name: `<:IrisLSMS:1133116950357213355> Radio LSMS`,
                    value: freqLSMS,
                    inline: true
                },
                {
                    name: `<:IrisLSPDCS:1133117105848471552> Radio FDO`,
                    value: freqFDO,
                    inline: true
                }
            ]);
            if(radio[0] == 'BCMS' && radio[1] == 'none') {
                //Reset des radios en DB
                await sqlRadio.updatedRadioDisplay('bcms', '0');
                const eventFreq = await sqlRadio.isRadioDisplayed('event');
                if(eventFreq[0].displayed == '1') {
                    newRadioEmb.addFields([
                        {
                            name: `\u200b`,
                            value: `\u200b`,
                            inline: true
                        },
                        {
                            name: `<:IrisEvent:1133705259596910624> Radio Event`,
                            value: freqEvent,
                            inline: true
                        }
                    ]);
                }
            }
            if(radio[0] == 'évènementielle' && radio[1] == 'none') {
                //Reset des radios en DB
                await sqlRadio.updatedRadioDisplay('event', '0');
                const bcmsFreq = await sqlRadio.isRadioDisplayed('bcms');
                if(bcmsFreq[0].displayed == '1') {
                    newRadioEmb.addFields([
                        {
                            name: `\u200b`,
                            value: `\u200b`,
                            inline: true
                        },
                        {
                            name: `<:IrisBCMS:1133150717125853297> Radio BCMS`,
                            value: freqBCMS,
                            inline: true
                        }
                    ]);
                }
            }
            if(radio[0] == 'BCMS' && radio[1] == 'évènementielle') {
                //Reset des radios en DB
                await sqlRadio.updatedRadioDisplay('bcms', '0');
                await sqlRadio.updatedRadioDisplay('event', '0');
            }
            if(radio[0] == 'évènementielle' && radio[1] == 'BCMS') {
                //Reset des radios en DB
                await sqlRadio.updatedRadioDisplay('bcms', '0');
                await sqlRadio.updatedRadioDisplay('event', '0');
            }
            //Envois du message
            await msg.edit({ embeds: [newRadioEmb], components: [radioBtns] });
        }
    }

}

async function sendBedsImage(letters, radioChan, bedsImg) {
    let lettersArray1 = [];
    let lettersArray2 = [];
    let lettersArray3 = [];
    let lettersArray4 = [];
    for(r=0;r<letters.length;r++) {
        if(r<5) {
            lettersArray1.push(letters[r].letter);
        } else if(r<10) {
            lettersArray2.push(letters[r].letter);
        } else if(r<15) {
            lettersArray3.push(letters[r].letter);
        } else {
            lettersArray4.push(letters[r].letter);
        }
    }
    if(letters.length == 0) {
        const bedsMsg = await radioChan.send({ content: bedsImg });
        await sqlBeds.clearMessageId();
        await sqlBeds.setMessageId(bedsMsg.id);
        gen = false;
    } else if(letters.length < 6) {
        const btns1 = btnCreator.genBedsBtns(lettersArray1);
        const bedsMsg = await radioChan.send({ content: bedsImg, components: [btns1] });
        await sqlBeds.clearMessageId();
        await sqlBeds.setMessageId(bedsMsg.id);
        gen = false;
    } else if(letters.length < 11) {
        const btns1 = btnCreator.genBedsBtns(lettersArray1);
        const btns2 = btnCreator.genBedsBtns(lettersArray2);
        const bedsMsg = await radioChan.send({ content: bedsImg, components: [btns1, btns2] });
        await sqlBeds.clearMessageId();
        await sqlBeds.setMessageId(bedsMsg.id);
        gen = false;
    } else if(letters.length < 16) {
        const btns1 = btnCreator.genBedsBtns(lettersArray1);
        const btns2 = btnCreator.genBedsBtns(lettersArray2);
        const btns3 = btnCreator.genBedsBtns(lettersArray3);
        const bedsMsg = await radioChan.send({ content: bedsImg, components: [btns1, btns2, btns3] });
        await sqlBeds.clearMessageId();
        await sqlBeds.setMessageId(bedsMsg.id);
        gen = false;
    } else if(letters.length < 21) {
        const btns1 = btnCreator.genBedsBtns(lettersArray1);
        const btns2 = btnCreator.genBedsBtns(lettersArray2);
        const btns3 = btnCreator.genBedsBtns(lettersArray3);
        const btns4 = btnCreator.genBedsBtns(lettersArray4);
        const bedsMsg = await radioChan.send({ content: bedsImg, components: [btns1, btns2, btns3, btns4] });
        await sqlBeds.clearMessageId();
        await sqlBeds.setMessageId(bedsMsg.id);
        gen = false;
    }
}

//Fonction séparée pour attendre la fin du check des messages un par un
function getServiceMessages(messages, client) {
    return new Promise((resolve, reject) => {
        messages.forEach(msg => {
            if(msg.author.username == client.user.username && msg.embeds[0] != null) {
                if(msg.embeds[0].author.name == 'Gestion du service') {
                    resolve(msg);
                    return;
                }
            }
        });
        resolve(false);
    });
}

function getCentraleMessages(messages, client) {
    return new Promise((resolve, reject) => {
        let found = 0;
        let existMsg;
        messages.forEach(msg => {
            if(msg.author.username == client.user.username && msg.embeds[0] != null) {
                if(msg.embeds[0].author != null) {
                    if(msg.embeds[0].author.name == 'Gestion des radios') {
                        found++;
                        existMsg = msg;
                    }
                }
            }
            if(msg.content.includes('/lit.png')) {
                found++;
                existMsg = msg;
            }
        });
        if(found == 1) {
            resolve(existMsg);
        } else {
            resolve(found);
        }
    });
}

function getIrisChannelMessages(messages) {
    return new Promise((resolve, reject) => {
        let count = 0;
        messages.forEach(async msg => {
            if(msg.author.id == process.env.IRIS_DISCORD_ID) {
                count ++;
            }
        });
        resolve(count);
    });
}