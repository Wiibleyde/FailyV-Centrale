//Récupération des fonctions pour créer une commande et un modal
const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
//Récup des requêtes SQL
const sqlFollow = require('./../sql/suivi/suivi');
const sqlFollowOrgan = require('./../sql/suivi/organes');
const sqlFollowPPA = require('./../sql/suivi/ppa');
const sqlFollowSecours = require('./../sql/suivi/secours');
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

//Variables Secours
let formaConfirmed;
let formaConfirmedCount;
let formaToCheck;
let formaToCheckCount;
let formaToForm;
let formaToFormCount;
let spWaiting;
let spWaitingCount;
let otherWaiting;
let otherWaitingCount;

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
                        txt = txt + `[2;37m-[0m [2;34m${patientName}[0m [2;37m|[0m [2;32m${patients[j].phone}[0m${end}\n`;
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

            for(let i=0;i<2;i++) {
                //Patients en liste Premiers Secours
                const members = await sqlFollowSecours.getByCat(i);
                const startTxt = '```ansi\n';
                const endTxt = '```';
                if(members[0] != null) {
                    if(i==0) {
                        for(let j=0;j<3;j++) {
                            let txt = '';
                            let count = 0;
                            const member = await sqlFollowSecours.getByFormaRank(j);
                            if(member[0] != null) {
                                count = member.length;
                                for(let k=0;k<member.length;k++) {
                                    const memberName = format.name(member[k].name);
                                    txt = txt + `[2;37m-[0m [2;34m${memberName}[0m [2;37m|[0m [2;35m${member[k].company}[0m [2;37m|[0m [2;32m${member[k].phone}[0m\n`;
                                }
                            } else { txt = '[2;34mPersonne[0m'; }
                            txt = startTxt + txt + endTxt;
                            switch(j) {
                                case 0:
                                    formaToForm = txt;
                                    formaToFormCount = count;
                                    break;
                                case 1:
                                    formaToCheck = txt;
                                    formaToCheckCount = count;
                                    break;
                                case 2:
                                    formaConfirmed = txt;
                                    formaConfirmedCount = count;
                                    break;
                                default:
                                    break;
                            }
                        }
                    } else {
                        for(let j=0;j<2;j++) {
                            let txt = '';
                            let count = 0;
                            let member;
                            if(j==0) {
                                member = await sqlFollowSecours.getPublicService();
                            } else {
                                member = await sqlFollowSecours.getOthers();
                            }
                            if(member[0] != null) {
                                count = member.length;
                                for(let k=0;k<member.length;k++) {
                                    const memberName = format.name(member[k].name);
                                    const formaRank = member[k].forma_rank;
                                    let state;
                                    if(formaRank == 0) {
                                        state = '🕑';
                                    } else {
                                        state = '✅';
                                    }
                                    txt = txt + `[2;37m-[0m ${state} [2;34m${memberName}[0m [2;37m|[0m [2;35m${member[k].company}[0m [2;37m|[0m [2;32m${member[k].phone}[0m\n`;
                                }
                            } else { txt = '[2;34mPersonne[0m'; }
                            txt = startTxt + txt + endTxt;
                            switch(j) {
                                case 0:
                                    spWaiting = txt;
                                    spWaitingCount = count;
                                    break;
                                case 1:
                                    otherWaiting = txt;
                                    otherWaitingCount = count;
                                    break;
                                default:
                                    break;
                            }
                        }
                    }
                } else {
                    if(i==0) {
                        let txt = '[2;34mPersonne[0m';
                        let count = 0;
                        txt = startTxt + txt + endTxt;
                        for(let j=0;j<3;j++) {
                            switch(j) {
                                case 0:
                                    formaToForm = txt;
                                    formaToFormCount = count;
                                    break;
                                case 1:
                                    formaToCheck = txt;
                                    formaToCheckCount = count;
                                    break;
                                case 2:
                                    formaConfirmed = txt;
                                    formaConfirmedCount = count;
                                    break;
                                default:
                                    break;
                            }
                        }
                    } else {
                        let txt = '[2;34mPersonne[0m';
                        let count = 0;
                        txt = startTxt + txt + endTxt;
                        for(let j=0;j<2;j++) {
                            switch(j) {
                                case 0:
                                    spWaiting = txt;
                                    spWaitingCount = count;
                                    break;
                                case 1:
                                    otherWaiting = txt;
                                    otherWaitingCount = count;
                                    break;
                                default:
                                    break;
                            }
                        }
                    }
                }
            }

            const isMessageExists = await sqlMessages.getMessage('organe8');
            const ppaThreadId = await sqlFollow.getFollowThreadPPAId();
            const isPPAMessageExists = await sqlMessages.getMessage('ppa10');
            const secoursThreadId = await sqlFollow.getFollowThreadSecoursId();
            const isSecoursMessageExists = await sqlMessages.getMessage('secours10');

            if(isMessageExists[0] != null && ppaThreadId[0] != null && isPPAMessageExists[0] != null && secoursThreadId[0] != null && isSecoursMessageExists[0] != null && messages.size == 11) {
                const ppaThread = await channel.threads.cache.get(ppaThreadId[0].id);
                const ppaMessages = await ppaThread.messages.fetch();
                const secoursThread = await channel.threads.cache.get(secoursThreadId[0].id);
                const secoursMessages = await secoursThread.messages.fetch();
                if(ppaMessages.size != 11) { await generatePPAMessages(ppaThread, ppaMessages); }
                if(secoursMessages.size != 13) { await generateSecoursMessages(secoursThread, secoursMessages); }
                if(ppaMessages.size == 11 && secoursMessages.size == 13) { await editMessages(channel, ppaThreadId, secoursThreadId, patients); }
            } else {
                await generateMessages(messages, channel, ppaThreadId, secoursThreadId, patients);
            }

            resolve(false);
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

function generateMessages(messages, channel, ppaThreadId, secoursThreadId, patients) {
    return new Promise(async (resolve, reject) => {
        logger.log('Starting resend of all follow messages');
        messages.forEach(async msg => {
            await msg.delete();
        });
        if(ppaThreadId[0] != null) {
            const ppaThread = await channel.threads.cache.get(ppaThreadId[0].id);
            await sqlFollow.deleteFollowThreadPPAId();
            await ppaThread.delete();
        }
        if(secoursThreadId[0] != null) {
            const secoursThread = await channel.threads.cache.get(secoursThreadId[0].id);
            await sqlFollow.deleteFollowThreadSecoursId();
            await secoursThread.delete();
        }

        const btnsOrgan = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setLabel('Retirer un/des organe(s)').setCustomId('followRemoveOrgans').setStyle(ButtonStyle.Secondary).setEmoji('➖').setDisabled(false),
            new ButtonBuilder().setLabel('Retirer un/des patient(s)').setCustomId('followRemoveOrgansPatient').setStyle(ButtonStyle.Secondary).setEmoji('➖').setDisabled(false)
        );

        const btnsPPA = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setLabel('Retirer un/des patient(s)').setCustomId('followRemovePPAPatient').setStyle(ButtonStyle.Secondary).setEmoji('➖').setDisabled(false)
        );

        const btnsSecoursForma = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setLabel('Mettre à jour le status d\'un formateur').setCustomId('followUpdateSecoursForma').setStyle(ButtonStyle.Primary).setEmoji('🔃').setDisabled(false),
            new ButtonBuilder().setLabel('Retirer un/des formateur(s)').setCustomId('followRemoveSecoursForma').setStyle(ButtonStyle.Secondary).setEmoji('➖').setDisabled(false)
        );

        const btnsSecoursPatient = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setLabel('Mettre à jour le status d\'une personne').setCustomId('followUpdateSecoursPatient').setStyle(ButtonStyle.Primary).setEmoji('🔃').setDisabled(false),
            new ButtonBuilder().setLabel('Retirer une/des personne(s)').setCustomId('followRemoveSecoursPatient').setStyle(ButtonStyle.Secondary).setEmoji('➖').setDisabled(false)
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
        const newPPAThread = await channel.threads.create({
            name: 'Suivi PPA',
            autoArchiveDuration: 4320
        });
        await sqlFollow.addFollowThreadPPAId(newPPAThread.id);
        const firstPPAMsg = await newPPAThread.send({ embeds: [emb.generate(`PPA`, null, null, process.env.LSMS_COLORCODE, null, null, null, null, null, null, null, false)] });
        const secPPAMsg = await newPPAThread.send({ embeds: [emb.generate(null, null, `**LSPD/LSCS** - ${fdoPatientsCount}`, process.env.LSMS_COLORCODE, null, null, null, null, null, null, null, false)] });
        await sqlMessages.deleteMessage('ppa1');
        await sqlMessages.setMessage('ppa1', secPPAMsg.id);
        const thirdPPAMsg = await newPPAThread.send({ content: fdoPatients });
        await sqlMessages.deleteMessage('ppa2');
        await sqlMessages.setMessage('ppa2', thirdPPAMsg.id);
        const fourthPPAMsg = await newPPAThread.send({ embeds: [emb.generate(null, null, `**LSMS/BCMS** - ${medicPatientsCount}`, process.env.LSMS_COLORCODE, null, null, null, null, null, null, null, false)] });
        await sqlMessages.deleteMessage('ppa3');
        await sqlMessages.setMessage('ppa3', fourthPPAMsg.id);
        const fifthPPAMsg = await newPPAThread.send({ content: medicPatients });
        await sqlMessages.deleteMessage('ppa4');
        await sqlMessages.setMessage('ppa4', fifthPPAMsg.id);
        const sixthPPAMsg = await newPPAThread.send({ embeds: [emb.generate(null, null, `**M$T** - ${mstPatientsCount}`, process.env.LSMS_COLORCODE, null, null, null, null, null, null, null, false)] });
        await sqlMessages.deleteMessage('ppa5');
        await sqlMessages.setMessage('ppa5', sixthPPAMsg.id);
        const seventhPPAMsg = await newPPAThread.send({ content: mstPatients });
        await sqlMessages.deleteMessage('ppa6');
        await sqlMessages.setMessage('ppa6', seventhPPAMsg.id);
        const eighthPPAMsg = await newPPAThread.send({ embeds: [emb.generate(null, null, `**Chasse** - ${chassePatientsCount}`, process.env.LSMS_COLORCODE, null, null, null, null, null, null, null, false)] });
        await sqlMessages.deleteMessage('ppa7');
        await sqlMessages.setMessage('ppa7', eighthPPAMsg.id);
        const ninthPPAMsg = await newPPAThread.send({ content: chassePatients });
        await sqlMessages.deleteMessage('ppa8');
        await sqlMessages.setMessage('ppa8', ninthPPAMsg.id);
        const tenthPPAMsg = await newPPAThread.send({ embeds: [emb.generate(null, null, `**Autre** - ${autrePatientsCount}`, process.env.LSMS_COLORCODE, null, null, null, null, null, null, null, false)] });
        await sqlMessages.deleteMessage('ppa9');
        await sqlMessages.setMessage('ppa9', tenthPPAMsg.id);
        const eleventhPPAMsg = await newPPAThread.send({ content: autrePatients, components: [btnsPPA] });
        await sqlMessages.deleteMessage('ppa10');
        await sqlMessages.setMessage('ppa10', eleventhPPAMsg.id);
        const newSecoursThread = await channel.threads.create({
            name: 'Suivi des Premiers Secours',
            autoArchiveDuration: 4320
        });
        await sqlFollow.addFollowThreadSecoursId(newSecoursThread.id);
        const firstSecoursMsg = await newSecoursThread.send({ embeds: [emb.generate(`Formateurs`, null, null, process.env.LSMS_COLORCODE, null, null, null, null, null, null, null, false)] });
        const secSecoursMsg = await newSecoursThread.send({ embeds: [emb.generate(null, null, `**Formateurs confirmés** - ${formaConfirmedCount}`, process.env.LSMS_COLORCODE, null, null, null, null, null, null, null, false)] });
        await sqlMessages.deleteMessage('secours1');
        await sqlMessages.setMessage('secours1', secSecoursMsg.id);
        const thirdSecoursMsg = await newSecoursThread.send({ content: formaConfirmed });
        await sqlMessages.deleteMessage('secours2');
        await sqlMessages.setMessage('secours2', thirdSecoursMsg.id);
        const fourthSecoursMsg = await newSecoursThread.send({ embeds: [emb.generate(null, null, `**Formations à valider** - ${formaToCheckCount}`, process.env.LSMS_COLORCODE, null, null, null, null, null, null, null, false)] });
        await sqlMessages.deleteMessage('secours3');
        await sqlMessages.setMessage('secours3', fourthSecoursMsg.id);
        const fifthSecoursMsg = await newSecoursThread.send({ content: formaToCheck });
        await sqlMessages.deleteMessage('secours4');
        await sqlMessages.setMessage('secours4', fifthSecoursMsg.id);
        const sixthSecoursMsg = await newSecoursThread.send({ embeds: [emb.generate(null, null, `**Intéressés par formation** - ${formaToFormCount}`, process.env.LSMS_COLORCODE, null, null, null, null, null, null, null, false)] });
        await sqlMessages.deleteMessage('secours5');
        await sqlMessages.setMessage('secours5', sixthSecoursMsg.id);
        const seventhSecoursMsg = await newSecoursThread.send({ content: formaToForm, components: [btnsSecoursForma] });
        await sqlMessages.deleteMessage('secours6');
        await sqlMessages.setMessage('secours6', seventhSecoursMsg.id);
        await newSecoursThread.send({ content: '\u200b\n\u200b\n\u200b\n\u200b\n\u200b' });
        const eighthSecoursMsg = await newSecoursThread.send({ embeds: [emb.generate(`Suivi des personnes en attente de diplôme`, null, null, process.env.LSMS_COLORCODE, null, null, null, null, null, null, null, false)] });
        const ninthSecoursMsg = await newSecoursThread.send({ embeds: [emb.generate(null, null, `**Services Publics** - ${spWaitingCount}`, process.env.LSMS_COLORCODE, null, null, null, null, null, null, null, false)] });
        await sqlMessages.deleteMessage('secours7');
        await sqlMessages.setMessage('secours7', ninthSecoursMsg.id);
        const tenthSecoursMsg = await newSecoursThread.send({ content: spWaiting });
        await sqlMessages.deleteMessage('secours8');
        await sqlMessages.setMessage('secours8', tenthSecoursMsg.id);
        const eleventhSecoursMsg = await newSecoursThread.send({ embeds: [emb.generate(null, null, `**Civils** - ${otherWaitingCount}`, process.env.LSMS_COLORCODE, null, null, null, null, null, null, null, false)] });
        await sqlMessages.deleteMessage('secours9');
        await sqlMessages.setMessage('secours9', eleventhSecoursMsg.id);
        const twelfthSecoursMsg = await newSecoursThread.send({ content: otherWaiting, components: [btnsSecoursPatient] });
        await sqlMessages.deleteMessage('secours10');
        await sqlMessages.setMessage('secours10', twelfthSecoursMsg.id);
        await firstPPAMsg.pin();
        await eighthSecoursMsg.pin();
        await firstSecoursMsg.pin();
        await firstOrganMsg.pin();
        await channel.messages.fetch({ limit: 1 }).then(async msg => {
            msg.map(m => m.delete());
        }).catch(logger.error);
        await newPPAThread.messages.fetch({ limit: 1 }).then(async msg => {
            msg.map(m => m.delete());
        }).catch(logger.error);
        await newSecoursThread.messages.fetch({ limit: 2 }).then(async msg => {
            msg.map(m => m.delete());
        }).catch(logger.error);
        resolve('Ok');
    });
}

function generatePPAMessages(channel, messages) {
    return new Promise(async (resolve, reject) => {
        logger.log('Starting resend of all PPA messages');
        messages.forEach(async msg => {
            await msg.delete();
        });

        const btnsPPA = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setLabel('Retirer un/des patient(s)').setCustomId('followRemovePPAPatient').setStyle(ButtonStyle.Secondary).setEmoji('➖').setDisabled(false)
        );
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
        await channel.messages.fetch({ limit: 1 }).then(async msg => {
            msg.map(m => m.delete());
        }).catch(logger.error);
        resolve('Ok');
    });
}

function generateSecoursMessages(channel, messages) {
    return new Promise(async (resolve, reject) => {
        logger.log('Starting resend of all first aid messages');
        messages.forEach(async msg => {
            await msg.delete();
        });

        const btnsSecoursForma = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setLabel('Mettre à jour le status d\'un formateur').setCustomId('followUpdateSecoursForma').setStyle(ButtonStyle.Primary).setEmoji('🔃').setDisabled(false),
            new ButtonBuilder().setLabel('Retirer un/des formateur(s)').setCustomId('followRemoveSecoursForma').setStyle(ButtonStyle.Secondary).setEmoji('➖').setDisabled(false)
        );

        const btnsSecoursPatient = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setLabel('Mettre à jour le status d\'une personne').setCustomId('followUpdateSecoursPatient').setStyle(ButtonStyle.Primary).setEmoji('🔃').setDisabled(false),
            new ButtonBuilder().setLabel('Retirer une/des personne(s)').setCustomId('followRemoveSecoursPatient').setStyle(ButtonStyle.Secondary).setEmoji('➖').setDisabled(false)
        );

        const firstSecoursMsg = await channel.send({ embeds: [emb.generate(`Formateurs`, null, null, process.env.LSMS_COLORCODE, null, null, null, null, null, null, null, false)] });
        const secSecoursMsg = await channel.send({ embeds: [emb.generate(null, null, `**Formateurs confirmés** - ${formaConfirmedCount}`, process.env.LSMS_COLORCODE, null, null, null, null, null, null, null, false)] });
        await sqlMessages.deleteMessage('secours1');
        await sqlMessages.setMessage('secours1', secSecoursMsg.id);
        const thirdSecoursMsg = await channel.send({ content: formaConfirmed });
        await sqlMessages.deleteMessage('secours2');
        await sqlMessages.setMessage('secours2', thirdSecoursMsg.id);
        const fourthSecoursMsg = await channel.send({ embeds: [emb.generate(null, null, `**Formations à valider** - ${formaToCheckCount}`, process.env.LSMS_COLORCODE, null, null, null, null, null, null, null, false)] });
        await sqlMessages.deleteMessage('secours3');
        await sqlMessages.setMessage('secours3', fourthSecoursMsg.id);
        const fifthSecoursMsg = await channel.send({ content: formaToCheck });
        await sqlMessages.deleteMessage('secours4');
        await sqlMessages.setMessage('secours4', fifthSecoursMsg.id);
        const sixthSecoursMsg = await channel.send({ embeds: [emb.generate(null, null, `**Intéressés par formation** - ${formaToFormCount}`, process.env.LSMS_COLORCODE, null, null, null, null, null, null, null, false)] });
        await sqlMessages.deleteMessage('secours5');
        await sqlMessages.setMessage('secours5', sixthSecoursMsg.id);
        const seventhSecoursMsg = await channel.send({ content: formaToForm, components: [btnsSecoursForma] });
        await sqlMessages.deleteMessage('secours6');
        await sqlMessages.setMessage('secours6', seventhSecoursMsg.id);
        await channel.send({ content: '\u200b\n\u200b\n\u200b\n\u200b\n\u200b' });
        const eighthSecoursMsg = await channel.send({ embeds: [emb.generate(`Suivi des personnes en attente de diplôme`, null, null, process.env.LSMS_COLORCODE, null, null, null, null, null, null, null, false)] });
        const ninthSecoursMsg = await channel.send({ embeds: [emb.generate(null, null, `**Services Publics** - ${spWaitingCount}`, process.env.LSMS_COLORCODE, null, null, null, null, null, null, null, false)] });
        await sqlMessages.deleteMessage('secours7');
        await sqlMessages.setMessage('secours7', ninthSecoursMsg.id);
        const tenthSecoursMsg = await channel.send({ content: spWaiting });
        await sqlMessages.deleteMessage('secours8');
        await sqlMessages.setMessage('secours8', tenthSecoursMsg.id);
        const eleventhSecoursMsg = await channel.send({ embeds: [emb.generate(null, null, `**Civils** - ${otherWaitingCount}`, process.env.LSMS_COLORCODE, null, null, null, null, null, null, null, false)] });
        await sqlMessages.deleteMessage('secours9');
        await sqlMessages.setMessage('secours9', eleventhSecoursMsg.id);
        const twelfthSecoursMsg = await channel.send({ content: otherWaiting, components: [btnsSecoursPatient] });
        await sqlMessages.deleteMessage('secours10');
        await sqlMessages.setMessage('secours10', twelfthSecoursMsg.id);
        await eighthSecoursMsg.pin();
        await firstSecoursMsg.pin();
        await channel.messages.fetch({ limit: 2 }).then(async msg => {
            msg.map(m => m.delete());
        }).catch(logger.error);
        resolve('Ok');
    });
}

function editMessages(channel, ppaThreadId, secoursThreadId, patients) {
    return new Promise(async (resolve, reject) => {
        let editingOrgans = false;
        let editingPPA = false;
        let editingFirstAid = false;
        const btns = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setLabel('Retirer un/des organe(s)').setCustomId('followRemoveOrgans').setStyle(ButtonStyle.Secondary).setEmoji('➖').setDisabled(false),
            new ButtonBuilder().setLabel('Retirer un/des patient(s)').setCustomId('followRemoveOrgansPatient').setStyle(ButtonStyle.Secondary).setEmoji('➖').setDisabled(false)
        );

        const btnsPPA = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setLabel('Retirer un/des patient(s)').setCustomId('followRemovePPAPatient').setStyle(ButtonStyle.Secondary).setEmoji('➖').setDisabled(false)
        );

        const btnsSecoursForma = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setLabel('Mettre à jour le status d\'un formateur').setCustomId('followUpdateSecoursForma').setStyle(ButtonStyle.Primary).setEmoji('🔃').setDisabled(false),
            new ButtonBuilder().setLabel('Retirer un/des formateur(s)').setCustomId('followRemoveSecoursForma').setStyle(ButtonStyle.Secondary).setEmoji('➖').setDisabled(false)
        );

        const btnsSecoursPatient = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setLabel('Mettre à jour le status d\'une personne').setCustomId('followUpdateSecoursPatient').setStyle(ButtonStyle.Primary).setEmoji('🔃').setDisabled(false),
            new ButtonBuilder().setLabel('Retirer une/des personne(s)').setCustomId('followRemoveSecoursPatient').setStyle(ButtonStyle.Secondary).setEmoji('➖').setDisabled(false)
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
        
        const secoursMsg1Id = await sqlMessages.getMessage('secours1');
        const secoursMsg2Id = await sqlMessages.getMessage('secours2');
        const secoursMsg3Id = await sqlMessages.getMessage('secours3');
        const secoursMsg4Id = await sqlMessages.getMessage('secours4');
        const secoursMsg5Id = await sqlMessages.getMessage('secours5');
        const secoursMsg6Id = await sqlMessages.getMessage('secours6');
        const secoursMsg7Id = await sqlMessages.getMessage('secours7');
        const secoursMsg8Id = await sqlMessages.getMessage('secours8');
        const secoursMsg9Id = await sqlMessages.getMessage('secours9');
        const secoursMsg10Id = await sqlMessages.getMessage('secours10');

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
                editingOrgans = true;
            }
            if(organMsg2.content != newOrganMsg2) {
                await organMsg2.edit({ content: newOrganMsg2 });
                editingOrgans = true;
            }
            if(organMsg3.embeds[0].data.description != newOrganMsg3.data.description) {
                await organMsg3.edit({ embeds: [newOrganMsg3] });
                editingOrgans = true;
            }
            if(organMsg4.content != newOrganMsg4) {
                await organMsg4.edit({ content: newOrganMsg4 });
                editingOrgans = true;
            }
            if(organMsg5.embeds[0].data.description != newOrganMsg5.data.description) {
                await organMsg5.edit({ embeds: [newOrganMsg5] });
                editingOrgans = true;
            }
            if(organMsg6.content != newOrganMsg6) {
                await organMsg6.edit({ content: newOrganMsg6 });
                editingOrgans = true;
            }
            if(organMsg7.embeds[0].data.description != newOrganMsg7.data.description) {
                await organMsg7.edit({ embeds: [newOrganMsg7] });
                editingOrgans = true;
            }
            if(organMsg8.content != newOrganMsg8) {
                await organMsg8.edit({ content: newOrganMsg8, components: [btns] });
                editingOrgans = true;
            }

            //PPA
            const ppaThread = channel.threads.cache.get(ppaThreadId[0].id);
            const ppaMsg1 = await ppaThread.messages.fetch(ppaMsg1Id[0].id);
            const ppaMsg2 = await ppaThread.messages.fetch(ppaMsg2Id[0].id);
            const ppaMsg3 = await ppaThread.messages.fetch(ppaMsg3Id[0].id);
            const ppaMsg4 = await ppaThread.messages.fetch(ppaMsg4Id[0].id);
            const ppaMsg5 = await ppaThread.messages.fetch(ppaMsg5Id[0].id);
            const ppaMsg6 = await ppaThread.messages.fetch(ppaMsg6Id[0].id);
            const ppaMsg7 = await ppaThread.messages.fetch(ppaMsg7Id[0].id);
            const ppaMsg8 = await ppaThread.messages.fetch(ppaMsg8Id[0].id);
            const ppaMsg9 = await ppaThread.messages.fetch(ppaMsg9Id[0].id);
            const ppaMsg10 = await ppaThread.messages.fetch(ppaMsg10Id[0].id);
            
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
                editingPPA = true;
            }
            if(ppaMsg2.content != newPPAMsg2) {
                await ppaMsg2.edit({ content: newPPAMsg2 });
                editingPPA = true;
            }
            if(ppaMsg3.embeds[0].data.description != newPPAMsg3.data.description) {
                await ppaMsg3.edit({ embeds: [newPPAMsg3] });
                editingPPA = true;
            }
            if(ppaMsg4.content != newPPAMsg4) {
                await ppaMsg4.edit({ content: newPPAMsg4 });
                editingPPA = true;
            }
            if(ppaMsg5.embeds[0].data.description != newPPAMsg5.data.description) {
                await ppaMsg5.edit({ embeds: [newPPAMsg5] });
                editingPPA = true;
            }
            if(ppaMsg6.content != newPPAMsg6) {
                await ppaMsg6.edit({ content: newPPAMsg6 });
                editingPPA = true;
            }
            if(ppaMsg7.embeds[0].data.description != newPPAMsg7.data.description) {
                await ppaMsg7.edit({ embeds: [newPPAMsg7] });
                editingPPA = true;
            }
            if(ppaMsg8.content != newPPAMsg8) {
                await ppaMsg8.edit({ content: newPPAMsg8 });
                editingPPA = true;
            }
            if(ppaMsg9.embeds[0].data.description != newPPAMsg9.data.description) {
                await ppaMsg9.edit({ embeds: [newPPAMsg9] });
                editingPPA = true;
            }
            if(ppaMsg10.content != newPPAMsg10) {
                await ppaMsg10.edit({ content: newPPAMsg10, components: [btnsPPA] });
                editingPPA = true;
            }

            //Secours
            const secoursThread = channel.threads.cache.get(secoursThreadId[0].id);
            const secoursMsg1 = await secoursThread.messages.fetch(secoursMsg1Id[0].id);
            const secoursMsg2 = await secoursThread.messages.fetch(secoursMsg2Id[0].id);
            const secoursMsg3 = await secoursThread.messages.fetch(secoursMsg3Id[0].id);
            const secoursMsg4 = await secoursThread.messages.fetch(secoursMsg4Id[0].id);
            const secoursMsg5 = await secoursThread.messages.fetch(secoursMsg5Id[0].id);
            const secoursMsg6 = await secoursThread.messages.fetch(secoursMsg6Id[0].id);
            const secoursMsg7 = await secoursThread.messages.fetch(secoursMsg7Id[0].id);
            const secoursMsg8 = await secoursThread.messages.fetch(secoursMsg8Id[0].id);
            const secoursMsg9 = await secoursThread.messages.fetch(secoursMsg9Id[0].id);
            const secoursMsg10 = await secoursThread.messages.fetch(secoursMsg10Id[0].id);
            
            const newSecoursMsg1 = emb.generate(null, null, `**Formateurs confirmés** - ${formaConfirmedCount}`, process.env.LSMS_COLORCODE, null, null, null, null, null, null, null, false);
            const newSecoursMsg2 = formaConfirmed;
            const newSecoursMsg3 = emb.generate(null, null, `**Formations à valider** - ${formaToCheckCount}`, process.env.LSMS_COLORCODE, null, null, null, null, null, null, null, false);
            const newSecoursMsg4 = formaToCheck;
            const newSecoursMsg5 = emb.generate(null, null, `**Intéressés par formation** - ${formaToFormCount}`, process.env.LSMS_COLORCODE, null, null, null, null, null, null, null, false);
            const newSecoursMsg6 = formaToForm;
            const newSecoursMsg7 = emb.generate(null, null, `**Services Publics** - ${spWaitingCount}`, process.env.LSMS_COLORCODE, null, null, null, null, null, null, null, false);
            const newSecoursMsg8 = spWaiting;
            const newSecoursMsg9 = emb.generate(null, null, `**Civils** - ${otherWaitingCount}`, process.env.LSMS_COLORCODE, null, null, null, null, null, null, null, false);
            const newSecoursMsg10 = otherWaiting;

            if(secoursMsg1.embeds[0].data.description != newSecoursMsg1.data.description) {
                await secoursMsg1.edit({ embeds: [newSecoursMsg1] });
                editingFirstAid = true;
            }
            if(secoursMsg2.content != newSecoursMsg2) {
                await secoursMsg2.edit({ content: newSecoursMsg2 });
                editingFirstAid = true;
            }
            if(secoursMsg3.embeds[0].data.description != newSecoursMsg3.data.description) {
                await secoursMsg3.edit({ embeds: [newSecoursMsg3] });
                editingFirstAid = true;
            }
            if(secoursMsg4.content != newSecoursMsg4) {
                await secoursMsg4.edit({ content: newSecoursMsg4 });
                editingFirstAid = true;
            }
            if(secoursMsg5.embeds[0].data.description != newSecoursMsg5.data.description) {
                await secoursMsg5.edit({ embeds: [newSecoursMsg5] });
                editingFirstAid = true;
            }
            if(secoursMsg6.content != newSecoursMsg6) {
                await secoursMsg6.edit({ content: newSecoursMsg6, components: [btnsSecoursForma] });
                editingFirstAid = true;
            }
            if(secoursMsg7.embeds[0].data.description != newSecoursMsg7.data.description) {
                await secoursMsg7.edit({ embeds: [newSecoursMsg7] });
                editingFirstAid = true;
            }
            if(secoursMsg8.content != newSecoursMsg8) {
                await secoursMsg8.edit({ content: newSecoursMsg8 });
                editingFirstAid = true;
            }
            if(secoursMsg9.embeds[0].data.description != newSecoursMsg9.data.description) {
                await secoursMsg9.edit({ embeds: [newSecoursMsg9] });
                editingFirstAid = true;
            }
            if(secoursMsg10.content != newSecoursMsg10) {
                await secoursMsg10.edit({ content: newSecoursMsg10, components: [btnsSecoursPatient] });
                editingFirstAid = true;
            }

            if(editingOrgans) { logger.log('Starting editing of organs messages'); }
            if(editingPPA) { logger.log('Starting editing of PPA messages'); }
            if(editingFirstAid) { logger.log('Starting editing of first aid messages'); }
        } catch (err) {
            logger.error(err);
        }

        resolve('Ok');
    });
}