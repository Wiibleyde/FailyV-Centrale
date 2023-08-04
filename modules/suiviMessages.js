//Récupération des fonctions pour créer une commande et un modal
const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
//Récup des requêtes SQL
const sqlFollow = require('./../sql/suivi/suivi');
const sqlFollowOrgan = require('./../sql/suivi/organes');
const sqlFollowPPA = require('./../sql/suivi/ppa');
const sqlMessages = require('./../sql/config/config');
//Récup du logger
const logger = require('./logger');
//Récup du créateur d'embed
const emb = require('./embeds');

const format = require('./formatName');

//Variables poumons
let availableLungs;
let expiredLungs;
let totalLungs;
let totalAvailableNumLungs;
let totalExpiredNumLungs;
//Variables reins
let availableKidney;
let expiredKidney;
let totalKidney;
let totalAvailableNumKidney;
let totalExpiredNumKidney;
//Variables foies
let availableLiver;
let expiredLiver;
let totalLiver;
let totalAvailableNumLiver;
let totalExpiredNumLiver;

//Variables PPA
let fdoPatients;
let fdoPatientsCount;
let medicPatients;
let medicPatientsCount;
let mstPatients;
let mstPatientsCount;
let chassePatients;
let chassePatientsCount;
let autrePatients;
let autrePatientsCount;

let fullTxt = '';

module.exports = {
    regen: (client) => {
        return new Promise(async (resolve, reject) => {

            const chan = await sqlFollow.getFollowChannelId();
            if(chan[0] == null) {
                reject('No channel id found!');
            }

            const channel = await client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).channels.cache.get(chan[0].id);
            const messages = await channel.messages.fetch();

            //Poumons
            const allLungs = await sqlFollowOrgan.getAllLungs();
            availableLungs = '```ansi\n[2;32mPoumons[0m [2;37m:[0m ';
            expiredLungs = '```ansi\n[2;31mPoumons[0m [2;37m:[0m ';
            totalLungs = '```ansi\n[2;34mPoumons[0m [2;37m:[0m ';
            totalAvailableNumLungs = 0;
            totalExpiredNumLungs = 0;
            generateDualSideOrganMessages('poumon', allLungs);
            //Reins
            const allKidney = await sqlFollowOrgan.getAllKidney();
            availableKidney = '[2;32mReins[0m [2;37m:[0m ';
            expiredKidney = '[2;31mReins[0m [2;37m:[0m ';
            totalKidney = '[2;34mReins[0m [2;37m:[0m ';
            totalAvailableNumKidney = 0;
            totalExpiredNumKidney = 0;
            generateDualSideOrganMessages('rein', allKidney);
            //Foies
            const allLiver = await sqlFollowOrgan.getAllLiver();
            availableLiver = '[2;32mFoies[0m [2;37m:[0m ';
            expiredLiver = '[2;31mFoies[0m [2;37m:[0m ';
            totalLiver = '[2;34mFoies[0m [2;37m:[0m ';
            totalAvailableNumLiver = 0;
            totalExpiredNumLiver = 0;
            generateSoloSideOrganMessages('foie', allLiver);

            //Patients en attente de greffe
            fullTxt = '';
            const patients = await sqlFollowOrgan.getPatients();
            const startTxt = '```ansi\n';
            const endTxt = '```';
            if(patients[0] != null) {
                for(i=0;i<patients.length;i++) {
                    let side = '';
                    if(patients[i].side == '1') {
                        side = ' [2;35mG[0m';
                    } else if(patients[i].side == '2') {
                        side = ' [2;35mD[0m';
                    } else if(patients[i].side == '3') {
                        side = ' [2;35mG[0m [2;37met[0m [2;35mD[0m';
                    }
                    const patientName = format.name(patients[i].name);
                    fullTxt = fullTxt + `[2;37m-[0m [2;34m${patientName}[0m [2;37m([0m[2;32m${patients[i].organ}[0m${side}[2;37m)[0m\n`;
                }
            } else { fullTxt = '[2;34mPersonne[0m' }
            fullTxt = startTxt + fullTxt + endTxt;

            for(i=0;i<5;i++) {
                //Patients en attente PPA
                let txt = '';
                let count = 0;
                const patients = await sqlFollowPPA.getByReason(i);
                const startTxt = '```ansi\n';
                const endTxt = '```';
                if(patients[0] != null) {
                    count = patients.length;
                    for(let j=0;j<patients.length;j++) {
                        const patientName = format.name(patients[j].name);
                        let end = '';
                        if(patients[j].type == '1') { end = ' [2;37m([0m[2;35mPPA2[0m[2;37m)[0m'; }
                        txt = txt + `[2;37m-[0m [2;34m${patientName}[0m [2;37m-[0m [2;32m${patients[j].phone}[0m${end}\n`;
                    }
                } else { txt = '[2;34mPersonne[0m' }
                txt = startTxt + txt + endTxt;
                switch(i) {
                    case 0:
                        fdoPatients = txt;
                        fdoPatientsCount = count;
                        break;
                    case 1:
                        medicPatients = txt;
                        medicPatientsCount = count;
                        break;
                    case 2:
                        mstPatients = txt;
                        mstPatientsCount = count;
                        break;
                    case 3:
                        chassePatients = txt;
                        chassePatientsCount = count;
                        break;
                    case 4:
                        autrePatients = txt;
                        autrePatientsCount = count;
                        break;
                    default:
                        autrePatients = txt;
                        autrePatientsCount = count;
                        break;
                }
            }

            const isMessageExists = await sqlMessages.getMessage('organe8');

            if(isMessageExists[0].id != null && messages.size == 21) {
                await editMessages(channel, patients);
            } else {
                await generateMessages(messages, channel, patients);
            }

            resolve('Ok');
        });
    }
}

function generateDualSideOrganMessages(organName, sqlList) {
    let availableOrganString = '';
    let expiredOrganString = '';
    let totalOrganString = '[2;36m0[0m [2;37msains |[0m [2;36m0[0m [2;37mnon sains[0m';
    let totalAvailableOrganNum = 0;
    let totalExpiredOrganNum = 0;
    if(sqlList[0] != null) {
        let availableLeftArray = [];
        let availableRightArray = [];
        let expiredLeftArray = [];
        let expiredRightArray = [];
        for(i=0;i<sqlList.length;i++) {
            if(sqlList[i].state == '0') {
                if(sqlList[i].side == '0') { availableLeftArray.push(sqlList[i]); } else { availableRightArray.push(sqlList[i]); }
            } else {
                if(sqlList[i].side == '0') { expiredLeftArray.push(sqlList[i]); } else { expiredRightArray.push(sqlList[i]); }
            }
        }
        //Vaildes
        availableOrganString = generateDualSideOrganString(availableLeftArray, availableRightArray, availableOrganString);

        //Périmés
        expiredOrganString = generateDualSideOrganString(expiredLeftArray, expiredRightArray, expiredOrganString);

        //Variables update
        totalAvailableOrganNum = availableLeftArray.length + availableRightArray.length;
        totalExpiredOrganNum = expiredLeftArray.length + expiredRightArray.length;
        totalOrganString = `[2;36m${availableLeftArray.length + availableRightArray.length}[0m [2;37msains |[0m [2;36m${expiredLeftArray.length + expiredRightArray.length}[0m [2;37mnon sains[0m`;
    } else {
        availableOrganString = '[2;36m0[0m';
        expiredOrganString = '[2;36m0[0m';
    }
    if(organName == 'poumon') {
        availableLungs = availableLungs + availableOrganString + '\n\n';
        expiredLungs = expiredLungs + expiredOrganString + '\n\n';
        totalLungs = totalLungs + totalOrganString + '\n\n';
        totalAvailableNumLungs = totalAvailableOrganNum;
        totalExpiredNumLungs = totalExpiredOrganNum;
    } else if(organName == 'rein') {
        availableKidney = availableKidney + availableOrganString + '\n\n';
        expiredKidney = expiredKidney + expiredOrganString + '\n\n';
        totalKidney = totalKidney + totalOrganString + '\n\n';
        totalAvailableNumKidney = totalAvailableOrganNum;
        totalExpiredNumKidney = totalExpiredOrganNum;
    }
    return 'Ok';
}

function generateDualSideOrganString(leftOrganArray, rightOrganArray, stringToEdit) {
    let formatedDates = [];

    if(leftOrganArray.length + rightOrganArray.length == 0) {
        return stringToEdit = '[2;36m0[0m';
    } else {
        for(i=0;i<leftOrganArray.length+rightOrganArray.length;i++) {
            //Date format
            let leftFormatedDate;
            let rightFormatedDate;
            if(leftOrganArray[i] != null) {
                leftFormatedDate = formatDate(leftOrganArray[i].expire_date);
            }
            if(rightOrganArray[i] != null) {
                rightFormatedDate = formatDate(rightOrganArray[i].expire_date);
            }

            if(leftOrganArray.length + rightOrganArray.length == 1) {
                if(leftOrganArray.length == 1) {
                    stringToEdit = stringToEdit + `[2;36m1[0m[2;35mG[0m [2;37m([0m[2;34m${leftFormatedDate}[0m[2;37m)[0m`;
                } else {
                    stringToEdit = stringToEdit + `[2;36m1[0m[2;35mD[0m [2;37m([0m[2;34m${rightFormatedDate}[0m[2;37m)[0m`;
                }
            } else {
                //Check numbers of same left date
                if(leftOrganArray[i] != null) {
                    if(!formatedDates.includes(leftFormatedDate)) {
                        let numLeft = 0;
                        let numRight = 0;
                        for(j=0;j<leftOrganArray.length;j++) {
                            if(formatDate(leftOrganArray[j].expire_date) == leftFormatedDate) {
                                numLeft ++;
                            }
                        }
                        if(rightOrganArray[i] != null) {
                            for(j=0;j<rightOrganArray.length;j++) {
                                if(formatDate(rightOrganArray[j].expire_date) == leftFormatedDate) {
                                    numRight ++;
                                }
                            }
                        }
                        if(numRight == 0) {
                            stringToEdit = stringToEdit + `[2;36m${numLeft}[0m[2;35mG[0m [2;37m([0m[2;34m${leftFormatedDate}[0m[2;37m) | [0m`;
                            formatedDates.push(leftFormatedDate);
                        } else {
                            if(numLeft == numRight) {
                                stringToEdit = stringToEdit + `[2;36m${numLeft + numRight}[0m [2;37m([0m[2;34m${leftFormatedDate}[0m[2;37m) | [0m`;
                                formatedDates.push(leftFormatedDate);
                            } else if(numLeft > numRight) {
                                stringToEdit = stringToEdit + `[2;36m${(numLeft + numRight) - (numLeft - numRight)}[0m [2;37m([0m[2;34m${leftFormatedDate}[0m[2;37m) | [0m`;
                                stringToEdit = stringToEdit + `[2;36m${numLeft - numRight}[0m[2;35mG[0m [2;37m([0m[2;34m${leftFormatedDate}[0m[2;37m) | [0m`;
                                formatedDates.push(leftFormatedDate);
                            } else if(numLeft < numRight) {
                                stringToEdit = stringToEdit + `[2;36m${(numLeft + numRight) - (numRight - numLeft)}[0m [2;37m([0m[2;34m${leftFormatedDate}[0m[2;37m) | [0m`;
                                stringToEdit = stringToEdit + `[2;36m${numRight - numLeft}[0m[2;35mD[0m [2;37m([0m[2;34m${leftFormatedDate}[0m[2;37m) | [0m`;
                                formatedDates.push(leftFormatedDate);
                            }
                        }
                    }
                }
                
                //Check numbers of same right date
                if(rightOrganArray[i] != null) {
                    if(!formatedDates.includes(rightFormatedDate)) {
                        let numLeft = 0;
                        let numRight = 0;
                        if(leftOrganArray[i] != null) {
                            for(j=0;j<leftOrganArray.length;j++) {
                                if(formatDate(leftOrganArray[j].expire_date) == rightFormatedDate) {
                                    numLeft ++;
                                }
                            }
                        }
                        for(j=0;j<rightOrganArray.length;j++) {
                            if(formatDate(rightOrganArray[j].expire_date) == rightFormatedDate) {
                                numRight ++;
                            }
                        }
                        if(numLeft == 0) {
                            stringToEdit = stringToEdit + `[2;36m${numRight}[0m[2;35mD[0m [2;37m([0m[2;34m${rightFormatedDate}[0m[2;37m) | [0m`;
                            formatedDates.push(rightFormatedDate);
                        } else {
                            if(numLeft == numRight) {
                                stringToEdit = stringToEdit + `[2;36m${numLeft + numRight}[0m [2;37m([0m[2;34m${rightFormatedDate}[0m[2;37m) | [0m`;
                                formatedDates.push(rightFormatedDate);
                            } else if(numLeft > numRight) {
                                stringToEdit = stringToEdit + `[2;36m${(numLeft-1) + numRight}[0m [2;37m([0m[2;34m${rightFormatedDate}[0m[2;37m) | [0m`;
                                stringToEdit = stringToEdit + `[2;36m${numLeft - numRight}[0m[2;35mG[0m [2;37m([0m[2;34m${rightFormatedDate}[0m[2;37m) | [0m`;
                                formatedDates.push(rightFormatedDate);
                            } else if(numLeft < numRight) {
                                stringToEdit = stringToEdit + `[2;36m${(numLeft-1) + numRight}[0m [2;37m([0m[2;34m${rightFormatedDate}[0m[2;37m) | [0m`;
                                stringToEdit = stringToEdit + `[2;36m${numRight - numLeft}[0m[2;35mD[0m [2;37m([0m[2;34m${rightFormatedDate}[0m[2;37m) | [0m`;
                                formatedDates.push(rightFormatedDate);
                            }
                        }
                    }
                }
            }

        }
        if(stringToEdit.includes('|')) {
            let lastSeparatorIndex;
            for(j=0;j<stringToEdit.length;j++) {
                if(stringToEdit.charAt(j) == '|') {
                    lastSeparatorIndex = j;
                }
            }
            stringToEdit = stringToEdit.slice(0, lastSeparatorIndex-1);
        }
        return stringToEdit;
    }
}

function generateSoloSideOrganMessages(organName, sqlList) {
    let availableOrganString = '';
    let expiredOrganString = '';
    let totalOrganString = '[2;36m0[0m [2;37msains |[0m [2;36m0[0m [2;37mnon sains[0m';
    let totalAvailableOrganNum = 0;
    let totalExpiredOrganNum = 0;
    if(sqlList[0] != null) {
        let availableArray = [];
        let expiredArray = [];
        for(i=0;i<sqlList.length;i++) {
            if(sqlList[i].state == '0') {
                availableArray.push(sqlList[i]);
            } else {
                expiredArray.push(sqlList[i]);
            }
        }
        //Vaildes
        availableOrganString = generateSoloSideOrganString(availableArray, availableOrganString);

        //Périmés
        expiredOrganString = generateSoloSideOrganString(expiredArray, expiredOrganString);

        //Variables update
        totalAvailableOrganNum = availableArray.length;
        totalExpiredOrganNum = expiredArray.length;
        totalOrganString = `[2;36m${totalAvailableOrganNum}[0m [2;37msains |[0m [2;36m${totalExpiredOrganNum}[0m [2;37mnon sains[0m`;
    } else {
        availableOrganString = '[2;36m0[0m';
        expiredOrganString = '[2;36m0[0m';
    }
    if(organName == 'foie') {
        availableLiver = availableLiver + availableOrganString + '\n```';
        expiredLiver = expiredLiver + expiredOrganString + '\n```';
        totalLiver = totalLiver + totalOrganString + '\n```';
        totalAvailableNumLiver = totalAvailableOrganNum;
        totalExpiredNumLiver = totalExpiredOrganNum;
    }
    return 'Ok';
}

function generateSoloSideOrganString(organArray, stringToEdit) {
    let formatedDates = [];

    if(organArray.length == 0) {
        return stringToEdit = '[2;36m0[0m';
    } else {
        for(i=0;i<organArray.length;i++) {
            //Date format
            let formatedDate = formatDate(organArray[i].expire_date);

            //Check numbers of same left date
            if(!formatedDates.includes(formatedDate)) {
                let count = 0;
                for(j=0;j<organArray.length;j++) {
                    if(formatDate(organArray[j].expire_date) == formatedDate) {
                        count ++;
                    }
                }
                stringToEdit = stringToEdit + `[2;36m${count}[0m [2;37m([0m[2;34m${formatedDate}[0m[2;37m) | [0m`;
                formatedDates.push(formatedDate);
            }

        }
        if(stringToEdit.includes('|')) {
            let lastSeparatorIndex;
            for(j=0;j<stringToEdit.length;j++) {
                if(stringToEdit.charAt(j) == '|') {
                    lastSeparatorIndex = j;
                }
            }
            stringToEdit = stringToEdit.slice(0, lastSeparatorIndex-1);
        }
        return stringToEdit;
    }
}

function formatDate(timestamp) {
    const date = new Date(timestamp + ' UTC+0:00');
    let month = date.getMonth() + 1;
    if (month < 10) month = '0' + month;
    let day = date.getDate();
    if (day < 10) day = '0' + day;
    return day + '/' + month;
}

function generateMessages(messages, channel, patients) {
    return new Promise(async (resolve, reject) => {
        messages.forEach(async msg => {
            await msg.delete();
        });

        const btnsOrgan = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setLabel('Retirer un/des organe(s)').setCustomId('followRemoveOrgans').setStyle(ButtonStyle.Secondary).setEmoji('➖').setDisabled(false),
            new ButtonBuilder().setLabel('Retirer un/des patient(s)').setCustomId('followRemoveOrgansPatient').setStyle(ButtonStyle.Secondary).setEmoji('➖').setDisabled(false)
        );

        const btnsPPA = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setLabel('Retirer un/des patient(s)').setCustomId('followRemovePPAPatient').setStyle(ButtonStyle.Secondary).setEmoji('➖').setDisabled(false)
        );
    
        const firstOrganMsg = await channel.send({ embeds: [emb.generate(`Organes`, null, null, process.env.LSMS_COLORCODE, null, null, null, null, null, null, null, false)] });
        const secOrganMsg = await channel.send({ embeds: [emb.generate(null, null, `**Sains** - ${totalAvailableNumLungs + totalAvailableNumKidney + totalAvailableNumLiver}`, process.env.LSMS_COLORCODE, null, null, null, null, null, null, null, false)] });
        await sqlMessages.deleteMessage('organe1');
        await sqlMessages.setMessage('organe1', secOrganMsg.id);
        const thirdOrganMsg = await channel.send({ content: availableLungs + availableKidney + availableLiver });
        await sqlMessages.deleteMessage('organe2');
        await sqlMessages.setMessage('organe2', thirdOrganMsg.id);
        const fourthOrganMsg = await channel.send({ embeds: [emb.generate(null, null, `**Non sains (à détruire)** - ${totalExpiredNumLungs + totalExpiredNumKidney + totalExpiredNumLiver}`, process.env.LSMS_COLORCODE, null, null, null, null, null, null, null, false)] });
        await sqlMessages.deleteMessage('organe3');
        await sqlMessages.setMessage('organe3', fourthOrganMsg.id);
        const fifthOrganMsg = await channel.send({ content: expiredLungs + expiredKidney + expiredLiver });
        await sqlMessages.deleteMessage('organe4');
        await sqlMessages.setMessage('organe4', fifthOrganMsg.id);
        const sixthOrganMsg = await channel.send({ embeds: [emb.generate(null, null, `**Total** - ${totalAvailableNumLungs + totalExpiredNumLungs + totalAvailableNumKidney + totalExpiredNumKidney + totalAvailableNumLiver + totalExpiredNumLiver}`, process.env.LSMS_COLORCODE, null, null, null, null, null, null, null, false)] });
        await sqlMessages.deleteMessage('organe5');
        await sqlMessages.setMessage('organe5', sixthOrganMsg.id);
        const seventhOrganMsg = await channel.send({ content: totalLungs + totalKidney + totalLiver });
        await sqlMessages.deleteMessage('organe6');
        await sqlMessages.setMessage('organe6', seventhOrganMsg.id);
        const eighthOrganMsg = await channel.send({ embeds: [emb.generate(null, null, `**En attente de greffe** - ${patients.length}`, process.env.LSMS_COLORCODE, null, null, null, null, null, null, null, false)] });
        await sqlMessages.deleteMessage('organe7');
        await sqlMessages.setMessage('organe7', eighthOrganMsg.id);
        const ninthOrganMsg = await channel.send({ content: fullTxt, components: [btnsOrgan] });
        await sqlMessages.deleteMessage('organe8');
        await sqlMessages.setMessage('organe8', ninthOrganMsg.id);
        await channel.send({ content: '\u200b\n\u200b\n\u200b\n\u200b\n\u200b' });
        const firstPPAMsg = await channel.send({ embeds: [emb.generate(`PPA`, null, null, process.env.LSMS_COLORCODE, null, null, null, null, null, null, null, false)] });
        const secPPAMsg = await channel.send({ embeds: [emb.generate(null, null, `**LSPD/LSCS** - ${fdoPatientsCount}`, process.env.LSMS_COLORCODE, null, null, null, null, null, null, null, false)] });
        await sqlMessages.deleteMessage('ppa1');
        await sqlMessages.setMessage('ppa1', secPPAMsg.id);
        const thirdPPAMsg = await channel.send({ content: fdoPatients });
        await sqlMessages.deleteMessage('ppa2');
        await sqlMessages.setMessage('ppa2', thirdPPAMsg.id);
        const fourthPPAMsg = await channel.send({ embeds: [emb.generate(null, null, `**LSMS/BCMS** - ${medicPatientsCount}`, process.env.LSMS_COLORCODE, null, null, null, null, null, null, null, false)] });
        await sqlMessages.deleteMessage('ppa3');
        await sqlMessages.setMessage('ppa3', fourthPPAMsg.id);
        const fifthPPAMsg = await channel.send({ content: medicPatients });
        await sqlMessages.deleteMessage('ppa4');
        await sqlMessages.setMessage('ppa4', fifthPPAMsg.id);
        const sixthPPAMsg = await channel.send({ embeds: [emb.generate(null, null, `**M$T** - ${mstPatientsCount}`, process.env.LSMS_COLORCODE, null, null, null, null, null, null, null, false)] });
        await sqlMessages.deleteMessage('ppa5');
        await sqlMessages.setMessage('ppa5', sixthPPAMsg.id);
        const seventhPPAMsg = await channel.send({ content: mstPatients });
        await sqlMessages.deleteMessage('ppa6');
        await sqlMessages.setMessage('ppa6', seventhPPAMsg.id);
        const eighthPPAMsg = await channel.send({ embeds: [emb.generate(null, null, `**Chasse** - ${chassePatientsCount}`, process.env.LSMS_COLORCODE, null, null, null, null, null, null, null, false)] });
        await sqlMessages.deleteMessage('ppa7');
        await sqlMessages.setMessage('ppa7', eighthPPAMsg.id);
        const ninthPPAMsg = await channel.send({ content: chassePatients });
        await sqlMessages.deleteMessage('ppa8');
        await sqlMessages.setMessage('ppa8', ninthPPAMsg.id);
        const tenthPPAMsg = await channel.send({ embeds: [emb.generate(null, null, `**Autre** - ${autrePatientsCount}`, process.env.LSMS_COLORCODE, null, null, null, null, null, null, null, false)] });
        await sqlMessages.deleteMessage('ppa9');
        await sqlMessages.setMessage('ppa9', tenthPPAMsg.id);
        const eleventhPPAMsg = await channel.send({ content: autrePatients, components: [btnsPPA] });
        await sqlMessages.deleteMessage('ppa10');
        await sqlMessages.setMessage('ppa10', eleventhPPAMsg.id);
        await firstPPAMsg.pin();
        await firstOrganMsg.pin();
        await channel.messages.fetch({ limit: 2 }).then(async msg => {
            msg.map(m => m.delete());
        }).catch(logger.error);
        resolve('Ok');
    });
}

function editMessages(channel, patients) {
    return new Promise(async (resolve, reject) => {
        const btns = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setLabel('Retirer un/des organe(s)').setCustomId('followRemoveOrgans').setStyle(ButtonStyle.Secondary).setEmoji('➖').setDisabled(false),
            new ButtonBuilder().setLabel('Retirer un/des patient(s)').setCustomId('followRemoveOrgansPatient').setStyle(ButtonStyle.Secondary).setEmoji('➖').setDisabled(false)
        );

        const btnsPPA = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setLabel('Retirer un/des patient(s)').setCustomId('followRemovePPAPatient').setStyle(ButtonStyle.Secondary).setEmoji('➖').setDisabled(false)
        );

        const organMsg1Id = await sqlMessages.getMessage('organe1');
        const organMsg2Id = await sqlMessages.getMessage('organe2');
        const organMsg3Id = await sqlMessages.getMessage('organe3');
        const organMsg4Id = await sqlMessages.getMessage('organe4');
        const organMsg5Id = await sqlMessages.getMessage('organe5');
        const organMsg6Id = await sqlMessages.getMessage('organe6');
        const organMsg7Id = await sqlMessages.getMessage('organe7');
        const organMsg8Id = await sqlMessages.getMessage('organe8');
        
        const ppaMsg1Id = await sqlMessages.getMessage('ppa1');
        const ppaMsg2Id = await sqlMessages.getMessage('ppa2');
        const ppaMsg3Id = await sqlMessages.getMessage('ppa3');
        const ppaMsg4Id = await sqlMessages.getMessage('ppa4');
        const ppaMsg5Id = await sqlMessages.getMessage('ppa5');
        const ppaMsg6Id = await sqlMessages.getMessage('ppa6');
        const ppaMsg7Id = await sqlMessages.getMessage('ppa7');
        const ppaMsg8Id = await sqlMessages.getMessage('ppa8');
        const ppaMsg9Id = await sqlMessages.getMessage('ppa9');
        const ppaMsg10Id = await sqlMessages.getMessage('ppa10');

        try {
            //Organs
            const organMsg1 = await channel.messages.fetch(organMsg1Id[0].id);
            const organMsg2 = await channel.messages.fetch(organMsg2Id[0].id);
            const organMsg3 = await channel.messages.fetch(organMsg3Id[0].id);
            const organMsg4 = await channel.messages.fetch(organMsg4Id[0].id);
            const organMsg5 = await channel.messages.fetch(organMsg5Id[0].id);
            const organMsg6 = await channel.messages.fetch(organMsg6Id[0].id);
            const organMsg7 = await channel.messages.fetch(organMsg7Id[0].id);
            const organMsg8 = await channel.messages.fetch(organMsg8Id[0].id);

            const newOrganMsg1 = emb.generate(null, null, `**Sains** - ${totalAvailableNumLungs + totalAvailableNumKidney + totalAvailableNumLiver}`, process.env.LSMS_COLORCODE, null, null, null, null, null, null, null, false);
            const newOrganMsg2 = availableLungs + availableKidney + availableLiver;
            const newOrganMsg3 = emb.generate(null, null, `**Non sains (à détruire)** - ${totalExpiredNumLungs + totalExpiredNumKidney + totalExpiredNumLiver}`, process.env.LSMS_COLORCODE, null, null, null, null, null, null, null, false);
            const newOrganMsg4 = expiredLungs + expiredKidney + expiredLiver;
            const newOrganMsg5 = emb.generate(null, null, `**Total** - ${totalAvailableNumLungs + totalExpiredNumLungs + totalAvailableNumKidney + totalExpiredNumKidney + totalAvailableNumLiver + totalExpiredNumLiver}`, process.env.LSMS_COLORCODE, null, null, null, null, null, null, null, false);
            const newOrganMsg6 = totalLungs + totalKidney + totalLiver;
            const newOrganMsg7 = emb.generate(null, null, `**En attente de greffe** - ${patients.length}`, process.env.LSMS_COLORCODE, null, null, null, null, null, null, null, false);
            const newOrganMsg8 = fullTxt;

            if(organMsg1.embeds[0].data.description != newOrganMsg1.data.description) {
                await organMsg1.edit({ embeds: [newOrganMsg1] });
            }
            if(organMsg2.content != newOrganMsg2) {
                await organMsg2.edit({ content: newOrganMsg2 });
            }
            if(organMsg3.embeds[0].data.description != newOrganMsg3.data.description) {
                await organMsg3.edit({ embeds: [newOrganMsg3] });
            }
            if(organMsg4.content != newOrganMsg4) {
                await organMsg4.edit({ content: newOrganMsg4 });
            }
            if(organMsg5.embeds[0].data.description != newOrganMsg5.data.description) {
                await organMsg5.edit({ embeds: [newOrganMsg5] });
            }
            if(organMsg6.content != newOrganMsg6) {
                await organMsg6.edit({ content: newOrganMsg6 });
            }
            if(organMsg7.embeds[0].data.description != newOrganMsg7.data.description) {
                await organMsg7.edit({ embeds: [newOrganMsg7] });
            }
            if(organMsg8.content != newOrganMsg8) {
                await organMsg8.edit({ content: newOrganMsg8, components: [btns] });
            }

            //PPA
            const ppaMsg1 = await channel.messages.fetch(ppaMsg1Id[0].id);
            const ppaMsg2 = await channel.messages.fetch(ppaMsg2Id[0].id);
            const ppaMsg3 = await channel.messages.fetch(ppaMsg3Id[0].id);
            const ppaMsg4 = await channel.messages.fetch(ppaMsg4Id[0].id);
            const ppaMsg5 = await channel.messages.fetch(ppaMsg5Id[0].id);
            const ppaMsg6 = await channel.messages.fetch(ppaMsg6Id[0].id);
            const ppaMsg7 = await channel.messages.fetch(ppaMsg7Id[0].id);
            const ppaMsg8 = await channel.messages.fetch(ppaMsg8Id[0].id);
            const ppaMsg9 = await channel.messages.fetch(ppaMsg9Id[0].id);
            const ppaMsg10 = await channel.messages.fetch(ppaMsg10Id[0].id);
            
            const newPPAMsg1 = emb.generate(null, null, `**LSPD/LSCS** - ${fdoPatientsCount}`, process.env.LSMS_COLORCODE, null, null, null, null, null, null, null, false);
            const newPPAMsg2 = fdoPatients;
            const newPPAMsg3 = emb.generate(null, null, `**LSMS/BCMS** - ${medicPatientsCount}`, process.env.LSMS_COLORCODE, null, null, null, null, null, null, null, false);
            const newPPAMsg4 = medicPatients;
            const newPPAMsg5 = emb.generate(null, null, `**M$T** - ${mstPatientsCount}`, process.env.LSMS_COLORCODE, null, null, null, null, null, null, null, false);
            const newPPAMsg6 = mstPatients;
            const newPPAMsg7 = emb.generate(null, null, `**Chasse** - ${chassePatientsCount}`, process.env.LSMS_COLORCODE, null, null, null, null, null, null, null, false);
            const newPPAMsg8 = chassePatients;
            const newPPAMsg9 = emb.generate(null, null, `**Autre** - ${autrePatientsCount}`, process.env.LSMS_COLORCODE, null, null, null, null, null, null, null, false);
            const newPPAMsg10 = autrePatients;

            if(ppaMsg1.embeds[0].data.description != newPPAMsg1.data.description) {
                await ppaMsg1.edit({ embeds: [newPPAMsg1] });
            }
            if(ppaMsg2.content != newPPAMsg2) {
                await ppaMsg2.edit({ content: newPPAMsg2 });
            }
            if(ppaMsg3.embeds[0].data.description != newPPAMsg3.data.description) {
                await ppaMsg3.edit({ embeds: [newPPAMsg3] });
            }
            if(ppaMsg4.content != newPPAMsg4) {
                await ppaMsg4.edit({ content: newPPAMsg4 });
            }
            if(ppaMsg5.embeds[0].data.description != newPPAMsg5.data.description) {
                await ppaMsg5.edit({ embeds: [newPPAMsg5] });
            }
            if(ppaMsg6.content != newPPAMsg6) {
                await ppaMsg6.edit({ content: newPPAMsg6 });
            }
            if(ppaMsg7.embeds[0].data.description != newPPAMsg7.data.description) {
                await ppaMsg7.edit({ embeds: [newPPAMsg7] });
            }
            if(ppaMsg8.content != newPPAMsg8) {
                await ppaMsg8.edit({ content: newPPAMsg8 });
            }
            if(ppaMsg9.embeds[0].data.description != newPPAMsg9.data.description) {
                await ppaMsg9.edit({ embeds: [newPPAMsg9] });
            }
            if(ppaMsg10.content != newPPAMsg10) {
                await ppaMsg10.edit({ content: newPPAMsg10, components: [btnsPPA] });
            }
        } catch (err) {
            logger.error(err);
        }

        resolve('Ok');
    });
}