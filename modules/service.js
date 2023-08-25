//Récupération des fonctions pour créer des boutons
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
//Récup du logger
const logger = require('./logger');
//Récup du créateur d'embed
const emb = require('./embeds');
//Récup des requêtes SQL
const sqlRadio = require('./../sql/radio/radios');
const sqlAgenda = require('./../sql/agenda/agenda');
const sqlFollow = require('./../sql/suivi/suivi');
const sqlBeds = require('./../sql/lit/lit');
const doctorCardSql = require('./../sql/doctorManagement/doctorCard');
//Récup des réactions
const btnCreator = require('./btnCreator');

const follow = require('./suiviMessages');

const sql = require('./../sql/config/config');

const ws = require('./commonRadioServer');

const cfx = require('./cfxStatus');

//Fonction pour attendre
const wait = require('node:timers/promises').setTimeout;

let blackout = false;

//Boutons de regen radios
const radioBtns = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('regenLSMS').setStyle(ButtonStyle.Danger).setEmoji('1133116950357213355').setDisabled(false),
    new ButtonBuilder().setCustomId('regenFDO').setStyle(ButtonStyle.Primary).setEmoji('1133117105848471552').setDisabled(false),
    new ButtonBuilder().setCustomId('regenBCMS').setStyle(ButtonStyle.Success).setEmoji('1124910870695256106').setDisabled(false),
    new ButtonBuilder().setCustomId('regenEvent').setStyle(ButtonStyle.Secondary).setEmoji('1121278617960329257').setDisabled(false),
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
let time = 0;

//Récupération des channels
let IRIS_SERVICE_CHANNEL_ID;
let IRIS_RADIO_CHANNEL_ID;
let IRIS_BCMS_CHANNEL_ID;
let IRIS_BCMS_BEDS_THREAD_ID;

function setGen(state) {
    gen = state;
}

function isGen() {
    return gen;
}

module.exports = {
    start: (client) => {
        //Boucle infinie pour auto-recréation en cas de supression
        setInterval(() => {
            if(time == 0) {
                testRegen(client);
            }
        }, 1);
    },
    setGen: (state) => {
        gen = state;
    },
    isGen: () => {
        return gen;
    },
    setBlackout: (state) => {
        blackout = state;
    },
    isBlackout: () => {
        return blackout;
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
            const radioEmb = emb.generate(null, null, `**Note: Ctrl+R à chaque prise de service !**\n\u200b`, process.env.LSMS_COLORCODE, process.env.LSMS_LOGO_V2, null, `Gestion des radios`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).icon}.webp`, null, null, null, false);
            radioEmb.addFields([
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
    resetSpecificRadio: async (client, interaction, reply, respContent, radio) => {
        if(interaction != null && reply != null && respContent != null) {
            try {
                await reply.edit({ embeds: [emb.generate(null, null, `<a:loading:1140500830672392283> Mise à jour en cours...`, `Gold`, process.env.LSMS_LOGO_V2, null, `Gestion des Premiers Secours`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], components: [], ephemeral: true })
            } catch (err) {
                await interaction.deferReply({ ephemeral: true });
            }
        }
        //Récupération du serveur Discord LSMS
        const guild = client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID);
        //Récupération du channel des radios
        const radioChan = guild.channels.cache.get(IRIS_RADIO_CHANNEL_ID);
        //Refresh de tous les messages du channel et check si message bien présent
        const radioMessageId = await sqlRadio.getRadioMessageId();
        const msg = await radioChan.messages.fetch(radioMessageId[0].id);
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
            const newRadioEmb = emb.generate(null, null, `**Note: Ctrl+R à chaque prise de service !**\n\u200b`, process.env.LSMS_COLORCODE, process.env.LSMS_LOGO_V2, null, `Gestion des radios`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).icon}.webp`, null, null, null, false);
            newRadioEmb.addFields([
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
                            value: "`" + freqEvent + "`",
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
                            value: "`" + freqBCMS + "`",
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
            setGen(false);
            if(interaction != null && reply != null && respContent != null) {
                try {
                    reply.edit({ embeds: [emb.generate(null, null, respContent + ` a/ont correctement été réinitialisée(s) !`, `#0DE600`, process.env.LSMS_LOGO_V2, null, `Gestion des radios`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, true)], components: [], ephemeral: true });
                    // Supprime la réponse après 5s
                    await wait(5000);
                    await reply.delete();
                } catch (err) {
                    logger.error(err);
                    interaction.followUp({ embeds: [emb.generate(null, null, respContent + ` a/ont correctement été réinitialisée(s) !`, `#0DE600`, process.env.LSMS_LOGO_V2, null, `Gestion des radios`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, true)], ephemeral: true });
                    // Supprime la réponse après 5s
                    await wait(5000);
                    await interaction.deleteReply();
                }
            }
        }
    }

}

async function testRegen(client) {
    if(isGen() == false) {
        time = 2000;
        IRIS_SERVICE_CHANNEL_ID = await awaitSQLGetChannel('IRIS_SERVICE_CHANNEL_ID');
        IRIS_RADIO_CHANNEL_ID = await awaitSQLGetChannel('IRIS_RADIO_CHANNEL_ID');
        IRIS_BCMS_CHANNEL_ID = await awaitSQLGetChannel('bcms_channel_id');
        IRIS_BCMS_BEDS_THREAD_ID = await awaitSQLGetChannel('bcms_beds_thread');
        //Récupération de l'image des lits
        let bedsImg;
        let bedsChannel = process.env.IRIS_BEDS_CHANNEL_ID;
        if(blackout) { bedsChannel = process.env.IRIS_BLACKOUT_BEDS_CHANNEL_ID; }
        await client.guilds.cache.get(process.env.IRIS_DEBUG_GUILD_ID).channels.cache.get(bedsChannel).messages.fetch({ limit: 1 }).then(messages => {
            if(messages.first() != null) {
                messages.first().attachments.map(bedImg => bedsImg = bedImg.attachment);
            }
        });
        //Récupération du serveur Discord LSMS
        const guild = client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID);
        const debugGuild = client.guilds.cache.get(process.env.IRIS_DEBUG_GUILD_ID);
        //Refresh de tous les messages du channel et check si les messages sont bien présents (service)
        let serviceChan;
        let messages;
        let found = true;
        if(IRIS_SERVICE_CHANNEL_ID != null) {
            serviceChan = guild.channels.cache.get(IRIS_SERVICE_CHANNEL_ID);
            messages = await serviceChan.messages.fetch();
            found = await getServiceMessages(messages, client);
        }
        //Refresh de tous les messages du channel et check si les messages sont bien présents (radios)
        let radioChan;
        let radioMessages;
        let radioFound = 2;
        if(IRIS_RADIO_CHANNEL_ID != null) {
            radioChan = guild.channels.cache.get(IRIS_RADIO_CHANNEL_ID);
            radioMessages = await radioChan.messages.fetch();
            radioFound = await getCentraleMessages(radioMessages, client);
        }
        //Refresh de tous les messages du channel et check si les messages sont bien présents (thread lit BCMS)
        let bcmsBedsThread;
        let bcmsBedsMessages;
        let bcmsBedsFound = 1;
        if(IRIS_BCMS_BEDS_THREAD_ID != null && IRIS_BCMS_CHANNEL_ID != null) {
            try {
                bcmsBedsThread = guild.channels.cache.get(IRIS_BCMS_BEDS_THREAD_ID);
                bcmsBedsMessages = await bcmsBedsThread.messages.fetch();
                bcmsBedsFound = await getCentraleMessages(bcmsBedsMessages, client);
            } catch (err) {
                logger.error(err);
            }
        } else if(IRIS_BCMS_BEDS_THREAD_ID == null && IRIS_BCMS_CHANNEL_ID != null) {
            const bcmsChannel = guild.channels.cache.get(IRIS_BCMS_CHANNEL_ID);
            bcmsBedsThread = await bcmsChannel.threads.create({
                name: 'Salle de réveil LSMS',
                autoArchiveDuration: 4320
            });
            await sql.setChannel('bcms_beds_thread', bcmsBedsThread.id);
            bcmsBedsFound = 0;
        }
        //Refresh de tous les messages du channel et check si les messages sont bien présents (agenda)
        const agendaChanId = await sqlAgenda.getAgendaChannelId();
        let agendaChan;
        let agendaMessages;
        let agendaMessagesCount = 0;
        if(agendaChanId[0] != null) {
            agendaChan = guild.channels.cache.get(agendaChanId[0].id);
            agendaMessages = await agendaChan.messages.fetch();
            agendaMessagesCount = await getIrisChannelMessages(agendaMessages);
        }
        const agendaWaiting = await sqlAgenda.getAllWaiting();
        //Refresh de tous les messages du channel et check si les messages sont bien présents (suivi)
        const followChanId = await sqlFollow.getFollowChannelId();
        const ppaThreadId = await sqlFollow.getFollowThreadPPAId();
        const secoursThreadId = await sqlFollow.getFollowThreadSecoursId();
        let followChan;
        let followMessages;
        let followMessagesCount = 11;
        let ppaThread;
        let ppaMessages;
        let ppaMessagesCount = 11;
        let secoursThread;
        let secoursMessages;
        let secoursMessagesCount = 13;
        if(followChanId[0] != null) {
            followChan = guild.channels.cache.get(followChanId[0].id);
            followMessages = await followChan.messages.fetch();
            followMessagesCount = await getIrisChannelMessages(followMessages);
        }
        if(followChanId[0] != null && ppaThreadId[0] != null) {
            ppaThread = await followChan.threads.cache.get(ppaThreadId[0].id);
            ppaMessages = await ppaThread.messages.fetch();
            ppaMessagesCount = await getIrisChannelMessages(ppaMessages);
        }
        if(followChanId[0] != null && secoursThreadId[0] != null) {
            secoursThread = await followChan.threads.cache.get(secoursThreadId[0].id);
            secoursMessages = await secoursThread.messages.fetch();
            secoursMessagesCount = await getIrisChannelMessages(secoursMessages);
        }
        const doctorCardData = await doctorCardSql.getDoctorCard();
        const templateFormId = await awaitSQLGetChannel('template_form');
        let doctorCardLength = 0;
        let templateFormMessages = [];
        let templateFormLength = 0;
        let templateFormChannel;
        if(templateFormId != null) {
            templateFormChannel = guild.channels.cache.get(templateFormId);
            for (const [_, value] of Object.entries(doctorCardData)) {
                if (value.position === 0) {
                    doctorCardLength++;
                } else {
                    doctorCardLength++;
                }
                for (const i in value.elements) {
                    doctorCardLength++;
                }
            }
            await templateFormChannel.messages.fetch().then(msg => msg.map(d => {
                templateFormMessages.push(d);
                if(d.author.id == client.user.id) {
                    templateFormLength++;
                }
            }));
        }
        const cfxThreadId = await awaitSQLGetChannel('cfx_thread');
        const cfxStatusMessageId = await sql.getMessage('cfx_status');
        let cfxThread;
        let cfxStatusMessage = null;
        if(cfxThreadId != null) {
            cfxThread = guild.channels.cache.get(cfxThreadId);
            try {
                cfxStatusMessage = await cfxThread.messages.fetch(cfxStatusMessageId[0].id);
            } catch (err) {}
        }
        const managementChannelId = process.env.IRIS_MANAGEMENT_CHANNEL_ID;
        let managementChannel;
        let managementMessage = null;
        if(managementChannelId != null) {
            managementChannel = debugGuild.channels.cache.get(managementChannelId);
            await managementChannel.messages.fetch().then(m => m.map((d) => {
                if(d.author.id == process.env.IRIS_DISCORD_ID && d.components.length != 0) {
                    managementMessage = d;
                }
            }));
        }
        //Si pas présent recréation du message
        if(!found) {
            setGen(true);
            //Base de l'embed
            const serviceEmb = emb.generate(null, null, `**Pour indiquer une prise/fin de service - Appuyez sur 🔴 \n\nPour prendre/relâcher le dispatch - Appuyez sur 🔵 \n\nPour indiquer un mal de tête - Appuyez sur ⚫**`, process.env.LSMS_COLORCODE, process.env.LSMS_LOGO_V2, null, `Gestion du service`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).icon}.webp`, null, null, null, false);
            //Envois
            await serviceChan.send({ embeds: [serviceEmb], components: [btns] });
            setGen(false);
        }
        if(radioFound != 2) {
            setGen(true);
            ws.askRadioInfo('lsms-lspd-lscs');
            ws.askRadioInfo('lsms-bcms');
            //Base de l'embed
            const radioEmb = emb.generate(null, null, `**Note: Ctrl+R à chaque prise de service !**\n\u200b`, process.env.LSMS_COLORCODE, process.env.LSMS_LOGO_V2, null, `Gestion des radios`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).icon}.webp`, null, null, null, false);
            //Radios
            var freqLSMS = await sqlRadio.getRadio('lsms');
            freqLSMS = freqLSMS[0].radiofreq;
            var freqFDO = await sqlRadio.getRadio('fdo');
            freqFDO = freqFDO[0].radiofreq;
            radioEmb.addFields([
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
                        value: "`" + freqBCMS + "`",
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
                        value: "`" + freqEvent + "`",
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
                        value: "`" + freqBCMS + "`",
                        inline: true
                    },
                    {
                        name: `<:IrisEvent:1133705259596910624> Radio Event`,
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
            let letters = await sqlBeds.getLetters();
            //Envois
            if(radioFound == 0) {
                const radioMsg = await radioChan.send({ embeds: [radioEmb], components: [radioBtns] });
                await sqlRadio.clearRadioMessageId();
                await sqlRadio.setRadioMessageId(radioMsg.id);
                await sendBedsImage(letters, radioChan, bedsImg, 'lit');
                radioMessages = await radioChan.messages.fetch();
                radioFound = await getCentraleMessages(radioMessages, client);
            } else if(radioFound.embeds != null) {
                if(radioFound.embeds[0].url != null) {
                    if(radioFound.embeds[0].url.includes('/lit.png') || radioFound.embeds[0].url.includes('/lit_blackout.png')) {
                        await radioFound.delete();
                        const radioMsg = await radioChan.send({ embeds: [radioEmb], components: [radioBtns] });
                        await sqlRadio.clearRadioMessageId();
                        await sqlRadio.setRadioMessageId(radioMsg.id);
                        await sendBedsImage(letters, radioChan, bedsImg, 'lit');
                        radioMessages = await radioChan.messages.fetch();
                        radioFound = await getCentraleMessages(radioMessages, client);
                    }
                } else if(radioFound.embeds[0].author != null) {
                    if(radioFound.embeds[0].author.name == 'Gestion des radios') {
                        await sendBedsImage(letters, radioChan, bedsImg, 'lit');
                        radioMessages = await radioChan.messages.fetch();
                        radioFound = await getCentraleMessages(radioMessages, client);
                    }
                }
            }
            setGen(false);
        }
        if(bcmsBedsFound == 0) {
            setGen(true);
            let letters = await sqlBeds.getLetters();
            //Envois
            await sendBedsImage(letters, bcmsBedsThread, bedsImg, 'lit_bcms');
            bcmsBedsMessages = await bcmsBedsThread.messages.fetch();
            bcmsBedsFound = await getCentraleMessages(bcmsBedsMessages, client);
            setGen(false);
        }
        if(agendaMessagesCount != agendaWaiting.length) {
            setGen(true);
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
                    {
                        name: `**Cause du décès**`,
                        value: agendaWaiting[i].cause,
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
            setGen(false);
        }
        if(followMessagesCount + ppaMessagesCount + secoursMessagesCount != 35) {
            setGen(true);
            const ended = await follow.regen(client);
            setGen(ended);
        }
        if(templateFormLength != doctorCardLength) {
            setGen(true);
            for(let i=0;i<templateFormMessages.length;i++) {
                await templateFormMessages[i].delete();
            }
            let message;
            for (const [_, value] of Object.entries(doctorCardData)) {
                const embed = emb.generate(value.name, null, null, value.color, null, null, null, null, null, null, null, false);
                if (value.position === 0) {
                    message = await templateFormChannel.send({ embeds: [embed] });
                } else {
                    await templateFormChannel.send({ embeds: [embed] });
                }
                for (const i in value.elements) {
                    await templateFormChannel.send(`- ${value.elements[i]}`);
                }
            }
            await message.pin();
            templateFormChannel.messages.fetch({ limit: 1 }).then(messages => {
                let lastMessage = messages.first();
                
                if (lastMessage.author.bot) {
                    lastMessage.delete();
                }
            })
            .catch(logger.error);
            setGen(false);
        }
        if(cfxStatusMessage == null && cfxThreadId != null) {
            setGen(true);
            await cfx.sendStatusEmbed(client, cfxThread);
            setGen(false);
        }
        if(managementMessage == null) {
            setGen(true);
            //Boutons de gestion du service
            const managementBtns = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setLabel('Debug').setCustomId('managementDebug').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setLabel('Workforce').setCustomId('managementWorkforce').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setLabel('BLACKOUT').setCustomId('managementBlackout').setStyle(ButtonStyle.Danger)
            );
            await managementChannel.send({ components: [managementBtns] });
            setGen(false);
        }
        for(let i=time;i>=0;i--) {
            time = i;
        }
    }
}

async function sendBedsImage(letters, channel, bedsImg, bed) {
    if(blackout) {
        const bedsMsg = await channel.send({ content: bedsImg });
        await sqlBeds.clearMessageId(bed);
        await sqlBeds.setMessageId(bedsMsg.id, bed);
        return;
    }
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
        const bedsMsg = await channel.send({ content: bedsImg });
        await sqlBeds.clearMessageId(bed);
        await sqlBeds.setMessageId(bedsMsg.id, bed);
    } else if(letters.length < 6) {
        const btns1 = btnCreator.genBedsBtns(lettersArray1);
        const bedsMsg = await channel.send({ content: bedsImg, components: [btns1] });
        await sqlBeds.clearMessageId(bed);
        await sqlBeds.setMessageId(bedsMsg.id, bed);
    } else if(letters.length < 11) {
        const btns1 = btnCreator.genBedsBtns(lettersArray1);
        const btns2 = btnCreator.genBedsBtns(lettersArray2);
        const bedsMsg = await channel.send({ content: bedsImg, components: [btns1, btns2] });
        await sqlBeds.clearMessageId(bed);
        await sqlBeds.setMessageId(bedsMsg.id, bed);
    } else if(letters.length < 16) {
        const btns1 = btnCreator.genBedsBtns(lettersArray1);
        const btns2 = btnCreator.genBedsBtns(lettersArray2);
        const btns3 = btnCreator.genBedsBtns(lettersArray3);
        const bedsMsg = await channel.send({ content: bedsImg, components: [btns1, btns2, btns3] });
        await sqlBeds.clearMessageId(bed);
        await sqlBeds.setMessageId(bedsMsg.id, bed);
    } else if(letters.length < 21) {
        const btns1 = btnCreator.genBedsBtns(lettersArray1);
        const btns2 = btnCreator.genBedsBtns(lettersArray2);
        const btns3 = btnCreator.genBedsBtns(lettersArray3);
        const btns4 = btnCreator.genBedsBtns(lettersArray4);
        const bedsMsg = await channel.send({ content: bedsImg, components: [btns1, btns2, btns3, btns4] });
        await sqlBeds.clearMessageId(bed);
        await sqlBeds.setMessageId(bedsMsg.id, bed);
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
            if(msg.content.includes('/lit.png') || msg.content.includes('/lit_blackout.png')) {
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

async function awaitSQLGetChannel(request) {
    let reponse = await sql.getChannel(request);
    if (reponse[0] == null) {
        return null;
    } else {
        return reponse[0].id;
    }
}