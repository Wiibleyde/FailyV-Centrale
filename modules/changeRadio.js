//Récupération des fonctions pour créer des boutons
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
//Récup des requêtes SQL
const sql = require('./../sql/radios');
//Récup du créateur d'embed
const emb = require('./embeds');
//Récup du logger
const logger = require('./logger');
//Fonction pour attendre
const wait = require('node:timers/promises').setTimeout;

const serviceID = process.env.IRIS_SERVICE_ROLE_ID;

//Boutons de regen radios
const radioBtns = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setLabel('LSMS').setCustomId('regenLSMS').setStyle(ButtonStyle.Danger).setEmoji('1124910934922625104').setDisabled(false),
    new ButtonBuilder().setLabel('FDO').setCustomId('regenFDO').setStyle(ButtonStyle.Primary).setEmoji('1124920279559327824').setDisabled(false),
    new ButtonBuilder().setLabel('BCMS').setCustomId('regenBCMS').setStyle(ButtonStyle.Success).setEmoji('1124910870695256106').setDisabled(false),
    new ButtonBuilder().setLabel('Event').setCustomId('regenEvent').setStyle(ButtonStyle.Secondary).setEmoji('1121278617960329257').setDisabled(false),
    new ButtonBuilder().setCustomId('serviceRadioReset').setStyle(ButtonStyle.Secondary).setEmoji('⚠️')
);

module.exports = {
    change: async (interaction, radioToChange, radioFreq) => {
        var pingMsg = `<@&${serviceID}> changement de fréquence radio `;
        //Recréation de l'embed pour édition du message
        const embed = emb.generate(null, null, null, `#FF0000`, process.env.LSMS_LOGO_V2, null, `Gestion des radios`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).icon}.webp`, null, null, null, false);
        //Récupération de la radio LSMS si non régénérée
        var freqLSMS = await sql.getRadio('lsms');
        freqLSMS = freqLSMS[0].radiofreq;
        var freqFDO = await sql.getRadio('fdo');
        freqFDO = freqFDO[0].radiofreq;
        //Changement de la fréquence si radio LSMS régen
        if(radioToChange == 'regenLSMS') { freqLSMS = radioFreq; await sql.setRadio('lsms', freqLSMS); pingMsg = pingMsg + '**LSMS** !'; }
        if(radioToChange == 'regenFDO') { freqFDO = radioFreq; pingMsg = pingMsg + '**commune LSMS - FDO** !'; }
        //Ajout des radios
        embed.addFields([
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
        //Création de variables de base
        var titleBCMS = '<:bcms:1128889752284844124> Radio BCMS';
        var titleEvent = '🏆 Radio Event';
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
        if(isBCMS == '1' && isEvent == '0') {
            embed.addFields([
                {
                    name: `\u200b`,
                    value: `\u200b`,
                    inline: true
                },
                {
                    name: titleBCMS,
                    value: freqBCMS,
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
                    value: freqEvent,
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
                    value: freqBCMS,
                    inline: true
                },
                {
                    name: titleEvent,
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
        const radioChan = interaction.guild.channels.cache.get(process.env.IRIS_RADIO_CHANNEL_ID);
        const messageToEdit = await getRadioMessages(await radioChan.messages.fetch(), interaction.client);
        //Édition du message
        await messageToEdit.edit({ embeds: [embed], components: [radioBtns] });
        const pingMessage = await radioChan.send({ content: pingMsg });
        // Supprime la réponse après 2min
        await wait(120000);
        await pingMessage.delete();
    }
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