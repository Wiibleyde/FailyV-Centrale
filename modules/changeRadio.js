//Récupération des fonctions pour créer des boutons
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
//Récup des requêtes SQL
const sql = require('./../sql/radio/radios');
//Récup du créateur d'embed
const emb = require('./embeds');
//Récup du logger
const logger = require('./logger');
//Fonction pour attendre
const wait = require('node:timers/promises').setTimeout;

const crypt = require('crypto');

const serviceID = process.env.IRIS_SERVICE_ROLE_ID;

const chanSql = require('./../sql/config/config');

const charAndInt = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const specialChar = `/^!@#$%&()_+-=[ ]{};':|,.<>?*"`;

//Boutons de regen radios
const radioBtns = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('regenLSMS').setStyle(ButtonStyle.Danger).setEmoji('1133116950357213355').setDisabled(false),
    new ButtonBuilder().setCustomId('regenFDO').setStyle(ButtonStyle.Primary).setEmoji('1133117105848471552').setDisabled(false),
    new ButtonBuilder().setCustomId('regenBCMS').setStyle(ButtonStyle.Success).setEmoji('1124910870695256106').setDisabled(false),
    new ButtonBuilder().setCustomId('regenEvent').setStyle(ButtonStyle.Secondary).setEmoji('1121278617960329257').setDisabled(false),
    new ButtonBuilder().setCustomId('serviceRadioReset').setStyle(ButtonStyle.Secondary).setEmoji('➖')
);

module.exports = {
    change: async (client, radioToChange, radioFreq, needToPing, isBlackout) => {
        let IRIS_RADIO_CHANNEL_ID = await chanSql.getChannel('IRIS_RADIO_CHANNEL_ID');
        if (IRIS_RADIO_CHANNEL_ID[0] == undefined) {
            return;
        } else {
            IRIS_RADIO_CHANNEL_ID = IRIS_RADIO_CHANNEL_ID[0].id;
        }
        var pingMsg = `<@&${serviceID}> changement de fréquence radio `;
        //Recréation de l'embed pour édition du message
        const embed = emb.generate(null, null, `**Note: Ctrl+R à chaque prise de service !**\n\u200b`, process.env.LSMS_COLORCODE, process.env.LSMS_LOGO_V2, null, `Gestion des radios`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).icon}.webp`, null, null, null, false);
        //Récupération de la radio LSMS si non régénérée
        var freqLSMS = await sql.getRadio('lsms');
        freqLSMS = freqLSMS[0].radiofreq;
        var freqFDO = await sql.getRadio('fdo');
        freqFDO = freqFDO[0].radiofreq;
        //Changement de la fréquence si radio LSMS régen
        if(radioToChange == 'regenLSMS') { freqLSMS = radioFreq; await sql.setRadio('lsms', freqLSMS); pingMsg = pingMsg + '**LSMS** !'; }
        if(radioToChange == 'regenFDO') { freqFDO = radioFreq; await sql.setRadio('fdo', freqFDO); pingMsg = pingMsg + '**commune LSMS - FDO** !'; }
        if(isBlackout) { freqLSMS = generateWeirdText(5); freqFDO = generateWeirdText(5); }
        //Ajout des radios
        embed.addFields([
            {
                name: `<:IrisLSMS:1133116950357213355> Radio LSMS`,
                value: "`" + freqLSMS + "`",
                inline: true
            },
            {
                name: `<:IrisLSPDCS:1133117105848471552> Radio FDO`,
                value: "`" + freqFDO + "`",
                inline: true
            }
        ]);
        //Création de variables de base
        var titleBCMS = '<:IrisBCMS:1133150717125853297> Radio BCMS';
        var titleEvent = '<:IrisEvent:1133705259596910624> Radio Event';
        var freqBCMS = await sql.getRadio('bcms');
        freqBCMS = freqBCMS[0].radiofreq;
        var freqEvent = await sql.getRadio('event');
        freqEvent = freqEvent[0].radiofreq;
        var freqToRegen;
        //Check de si les radios optionnelles doivent être affichées
        var genBCMS = await sql.isRadioDisplayed('bcms');
        genBCMS = genBCMS[0].displayed;
        var genEvent = await sql.isRadioDisplayed('event');
        genEvent = genEvent[0].displayed;
        var isBCMS = await sql.isRadioDisplayed('bcms');
        isBCMS = isBCMS[0].displayed;
        var isEvent = await sql.isRadioDisplayed('event');
        isEvent = isEvent[0].displayed;
        //Changement de la fréquence si radio BCMS régen
        if(radioToChange == 'regenBCMS') { freqBCMS = radioFreq; isBCMS = '1'; await sql.updatedRadioDisplay('bcms', '1'); await sql.setRadio('bcms', freqBCMS); freqToRegen = 'bcms'; pingMsg = pingMsg + '**commune LSMS - BCMS** !'; }
        //Changement de la fréquence si radio Event régen
        if(radioToChange == 'regenEvent') { freqEvent = radioFreq; isEvent = '1'; await sql.updatedRadioDisplay('event', '1'); await sql.setRadio('event', freqEvent); freqToRegen = 'event'; pingMsg = pingMsg + '**évènementielle** !'; }
        if(isBlackout) {
            freqBCMS = generateWeirdText(5); isBCMS = '1';
            freqEvent = generateWeirdText(5); isEvent = '1';
            pingMsg = generateWeirdText(pingMsg.length);
        }
        if(isBCMS == '1' && isEvent == '0') {
            embed.addFields([
                {
                    name: `\u200b`,
                    value: `\u200b`,
                    inline: true
                },
                {
                    name: titleBCMS,
                    value: "`" + freqBCMS + "`",
                    inline: true
                },
            ]);
        } else if(isBCMS == '0' && isEvent == '1') {
            embed.addFields([
                {
                    name: `\u200b`,
                    value: `\u200b`,
                    inline: true
                },
                {
                    name: titleEvent,
                    value: "`" + freqEvent + "`",
                    inline: true
                },
            ]);
        } else if(isBCMS == '1' && isEvent == '1') {
            embed.addFields([
                {
                    name: `\u200b`,
                    value: `\u200b`,
                    inline: true
                },
                {
                    name: titleBCMS,
                    value: "`" + freqBCMS + "`",
                    inline: true
                },
                {
                    name: titleEvent,
                    value: "`" + freqEvent + "`",
                    inline: true
                },
                {
                    name: `\u200b`,
                    value: `\u200b`,
                    inline: true
                }
            ]);
        }
        const radioChan = client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).channels.cache.get(IRIS_RADIO_CHANNEL_ID);
        const messageRadioId = await sql.getRadioMessageId();
        try {
            const messageToEdit = await radioChan.messages.fetch(messageRadioId[0].id);
            //Édition du message
            await messageToEdit.edit({ embeds: [embed], components: [radioBtns] });
            if(needToPing) {
                const pingMessage = await radioChan.send({ content: pingMsg });
                if(!isBlackout) {
                    // Supprime la réponse après 2min
                    await wait(120000);
                    await pingMessage.delete();
                }
            }
        } catch (error) {
            logger.error(error);
        }
    }
}

function generateWeirdText(length) {
    let weirdText = '';
    for(let i=0;i<length;i++) {
        const whereToFetch = crypt.randomInt(0, 2);
        if(whereToFetch == 0) {
            const charInt = crypt.randomInt(0, charAndInt.length + 1);
            weirdText = weirdText + charAndInt.charAt(charInt);
        } else {
            const charInt = crypt.randomInt(0, specialChar.length + 1);
            weirdText = weirdText + specialChar.charAt(charInt);
        }
    }
    return weirdText;
}