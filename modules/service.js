//Récupération des fonctions pour créer des boutons
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
//Récup du logger
const logger = require('./logger');
//Récup du créateur d'embed
const emb = require('./embeds');
//Récup des requêtes SQL
const sql = require('./../sql/radio/radios');
//Récup des reqêtes SQL pour les lits
const beds = require('./../sql/lit/lit');
//Récup des réactions
const btnCreator = require('./btnCreator');

//Boutons de regen radios
const radioBtns = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setLabel('LSMS').setCustomId('regenLSMS').setStyle(ButtonStyle.Danger).setEmoji('1133116950357213355').setDisabled(false),
    new ButtonBuilder().setLabel('FDO').setCustomId('regenFDO').setStyle(ButtonStyle.Primary).setEmoji('1124920279559327824').setDisabled(false),
    new ButtonBuilder().setLabel('BCMS').setCustomId('regenBCMS').setStyle(ButtonStyle.Success).setEmoji('1124910870695256106').setDisabled(false),
    new ButtonBuilder().setLabel('Event').setCustomId('regenEvent').setStyle(ButtonStyle.Secondary).setEmoji('1121278617960329257').setDisabled(false),
    new ButtonBuilder().setCustomId('serviceRadioReset').setStyle(ButtonStyle.Secondary).setEmoji('⚠️')
);
//Boutons de gestion du service
const btns = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setLabel('Service').setCustomId('serviceSwitch').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setLabel('Dispatch').setCustomId('serviceDispatch').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setLabel('Aïe la tête').setCustomId('serviceSwitchOff').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('serviceManage').setStyle(ButtonStyle.Secondary).setEmoji('1128896218672681090')
);

let gen = false;

module.exports = {
    start: (client) => {
        //Boucle infinie pour auto-recréation en cas de supression
        setInterval(async () => {
            //Récupération de l'image des lits
            let bedsImg;
            client.guilds.cache.get(process.env.IRIS_DEBUG_GUILD_ID).channels.cache.get(process.env.IRIS_BEDS_CHANNEL_ID).messages.fetch({ limit: 1 }).then(messages => {
                messages.first().attachments.map(bedImg => bedsImg = bedImg.attachment);
            });
            //Récupération du serveur Discord LSMS
            const guild = client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID);
            //Récupération du channel de service
            const chan = guild.channels.cache.get(process.env.IRIS_SERVICE_CHANNEL_ID);
            //Récupération du channel des radios
            const radioChan = guild.channels.cache.get(process.env.IRIS_RADIO_CHANNEL_ID);
            //Refresh de tous les messages du channel et check si les messages sont bien présents
            const messages = await chan.messages.fetch();
            const found = await getServiceMessages(messages, client);
            const radioMessages = await radioChan.messages.fetch();
            const radioFound = await getCentraleMessages(radioMessages, client);
            //Si pas présent recréation du message
            if(!found) {
                //Base de l'embed
                const serviceEmb = emb.generate(null, null, `**Pour indiquer une prise/fin de service - Appuyez sur 🔴 \n\nPour prendre/relâcher le dispatch - Appuyez sur 🔵 \n\nPour indiquer un mal de tête - Appuyez sur ⚫**`, process.env.LSMS_COLORCODE, process.env.LSMS_LOGO_V2, null, `Gestion du service`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).icon}.webp`, null, null, null, false);
                //Envois
                await chan.send({ embeds: [serviceEmb], components: [btns] });
            }
            if(radioFound != 2) {
                if(gen == false) {
                    gen = true;
                    //Base de l'embed
                    const radioEmb = emb.generate(null, null, null, process.env.LSMS_COLORCODE, process.env.LSMS_LOGO_V2, null, `Gestion des radios`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).icon}.webp`, null, null, null, false);
                    //Radios
                    var freqLSMS = await sql.getRadio('lsms');
                    freqLSMS = freqLSMS[0].radiofreq;
                    var freqFDO = await sql.getRadio('fdo');
                    freqFDO = freqFDO[0].radiofreq;
                    radioEmb.addFields([
                        {
                            name: `<:IrisLSMS:1133116950357213355> Radio LSMS`,
                            value: freqLSMS,
                            inline: true
                        },
                        {
                            name: `<:LSPDCS:1133117105848471552> Radio FDO`,
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
                    let letters = await beds.getLetters();
                    //Envois
                    if(radioFound == 0) {
                        const radioMsg = await radioChan.send({ embeds: [radioEmb], components: [radioBtns] });
                        sendBedsImage(letters, radioChan, bedsImg);
                        await sql.clearRadioMessageId();
                        await sql.setRadioMessageId(radioMsg.id);
                    }
                    if(radioFound.embeds != null) {
                        if(radioFound.embeds[0].url != null) {
                            if(radioFound.embeds[0].url.includes('/lit.png')) {
                                await radioFound.delete();
                                const radioMsg = await radioChan.send({ embeds: [radioEmb], components: [radioBtns] });
                                sendBedsImage(letters, radioChan, bedsImg);
                                await sql.clearRadioMessageId();
                                await sql.setRadioMessageId(radioMsg.id);
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
        const radioChan = guild.channels.cache.get(process.env.IRIS_RADIO_CHANNEL_ID);
        //Refresh de tous les messages du channel et check si message bien présent
        const radioMessageId = sql.getRadioMessageId();
        const msg = radioChan.messages.fetch(radioMessageId[0].id);
        if(msg != false) {
            //Reset de l'embed
            const radioEmb = emb.generate(null, null, null, process.env.LSMS_COLORCODE, process.env.LSMS_LOGO_V2, null, `Gestion des radios`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).icon}.webp`, null, null, null, false);
            radioEmb.addFields([
                {
                    name: `<:IrisLSMS:1133116950357213355> Radio LSMS`,
                    value: freqLSMS,
                    inline: true
                },
                {
                    name: `<:LSPDCS:1133117105848471552> Radio FDO`,
                    value: freqFDO,
                    inline: true
                }
            ]);
            //Reset des radios en DB
            await sql.setRadio('lsms', freqLSMS);
            await sql.setRadio('fdo', freqFDO);
            await sql.setRadio('bcms', '0.0');
            await sql.updatedRadioDisplay('bcms', '0');
            await sql.setRadio('event', '0.0');
            await sql.updatedRadioDisplay('event', '0');
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
        const radioChan = guild.channels.cache.get(process.env.IRIS_RADIO_CHANNEL_ID);
        //Refresh de tous les messages du channel et check si message bien présent
        const radioMessageId = sql.getRadioMessageId();
        const msg = radioChan.messages.fetch(radioMessageId[0].id);
        var freqLSMS = await sql.getRadio('lsms');
        freqLSMS = freqLSMS[0].radiofreq;
        var freqFDO = await sql.getRadio('fdo');
        freqFDO = freqFDO[0].radiofreq;
        var freqBCMS = await sql.getRadio('bcms');
        freqBCMS = freqBCMS[0].radiofreq;
        var freqEvent = await sql.getRadio('event');
        freqEvent = freqEvent[0].radiofreq;
        if(msg) {
            //Reset de l'embed
            const newRadioEmb = emb.generate(null, null, null, process.env.LSMS_COLORCODE, process.env.LSMS_LOGO_V2, null, `Gestion des radios`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).icon}.webp`, null, null, null, false);
            newRadioEmb.addFields([
                {
                    name: `<:IrisLSMS:1133116950357213355> Radio LSMS`,
                    value: freqLSMS,
                    inline: true
                },
                {
                    name: `<:LSPDCS:1133117105848471552> Radio FDO`,
                    value: freqFDO,
                    inline: true
                }
            ]);
            if(radio[0] == 'BCMS' && radio[1] == 'none') {
                //Reset des radios en DB
                await sql.updatedRadioDisplay('bcms', '0');
                const eventFreq = await sql.isRadioDisplayed('event');
                if(eventFreq[0].displayed == '1') {
                    newRadioEmb.addFields([
                        {
                            name: `\u200b`,
                            value: `\u200b`,
                            inline: true
                        },
                        {
                            name: `🏆 Radio Event`,
                            value: freqEvent,
                            inline: true
                        }
                    ]);
                }
            }
            if(radio[0] == 'évènementielle' && radio[1] == 'none') {
                //Reset des radios en DB
                await sql.updatedRadioDisplay('event', '0');
                const bcmsFreq = await sql.isRadioDisplayed('bcms');
                if(bcmsFreq[0].displayed == '1') {
                    newRadioEmb.addFields([
                        {
                            name: `\u200b`,
                            value: `\u200b`,
                            inline: true
                        },
                        {
                            name: `<:bcms:1128889752284844124> Radio BCMS`,
                            value: freqBCMS,
                            inline: true
                        }
                    ]);
                }
            }
            if(radio[0] == 'BCMS' && radio[1] == 'évènementielle') {
                //Reset des radios en DB
                await sql.updatedRadioDisplay('bcms', '0');
                await sql.updatedRadioDisplay('event', '0');
            }
            if(radio[0] == 'évènementielle' && radio[1] == 'BCMS') {
                //Reset des radios en DB
                await sql.updatedRadioDisplay('bcms', '0');
                await sql.updatedRadioDisplay('event', '0');
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
        await beds.clearMessageId();
        await beds.setMessageId(bedsMsg.id);
        gen = false;
    } else if(letters.length < 6) {
        const btns1 = btnCreator.genBedsBtns(lettersArray1);
        const bedsMsg = await radioChan.send({ content: bedsImg, components: [btns1] });
        await beds.clearMessageId();
        await beds.setMessageId(bedsMsg.id);
        gen = false;
    } else if(letters.length < 11) {
        const btns1 = btnCreator.genBedsBtns(lettersArray1);
        const btns2 = btnCreator.genBedsBtns(lettersArray2);
        const bedsMsg = await radioChan.send({ content: bedsImg, components: [btns1, btns2] });
        await beds.clearMessageId();
        await beds.setMessageId(bedsMsg.id);
        gen = false;
    } else if(letters.length < 16) {
        const btns1 = btnCreator.genBedsBtns(lettersArray1);
        const btns2 = btnCreator.genBedsBtns(lettersArray2);
        const btns3 = btnCreator.genBedsBtns(lettersArray3);
        const bedsMsg = await radioChan.send({ content: bedsImg, components: [btns1, btns2, btns3] });
        await beds.clearMessageId();
        await beds.setMessageId(bedsMsg.id);
        gen = false;
    } else if(letters.length < 21) {
        const btns1 = btnCreator.genBedsBtns(lettersArray1);
        const btns2 = btnCreator.genBedsBtns(lettersArray2);
        const btns3 = btnCreator.genBedsBtns(lettersArray3);
        const btns4 = btnCreator.genBedsBtns(lettersArray4);
        const bedsMsg = await radioChan.send({ content: bedsImg, components: [btns1, btns2, btns3, btns4] });
        await beds.clearMessageId();
        await beds.setMessageId(bedsMsg.id);
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

function getRadioMessages(messages, client) {
    return new Promise((resolve, reject) => {
        messages.forEach(msg => {
            if(msg.author.username == client.user.username && msg.embeds[0] != null) {
                if(msg.embeds[0].author != null) {
                    if(msg.embeds[0].author.name == 'Gestion des radios') {
                        resolve(msg);
                    }
                }
            }
        });
    });
}