//Récupération des fonctions pour créer une commande et un modal
const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
//Récup des requêtes SQL
const sqlFollow = require('./../sql/suivi/suivi');
const sqlFollowOrgan = require('./../sql/suivi/organes');
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

module.exports = {
    regen: (client) => {
        return new Promise(async (resolve, reject) => {

            const chan = await sqlFollow.getFollowChannelId();
            if(chan[0] == null) {
                reject('No channel id found!');
            }

            const channel = await client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).channels.cache.get(chan[0].id);
            const messages = await channel.messages.fetch();

            messages.forEach(async msg => {
                await msg.delete();
            });

            const btns = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setLabel('Retirer un/des organe(s)').setCustomId('followRemoveOrgans').setStyle(ButtonStyle.Secondary).setEmoji('➖').setDisabled(false),
                new ButtonBuilder().setLabel('Retirer un/des patient(s)').setCustomId('followRemoveOrgansPatient').setStyle(ButtonStyle.Secondary).setEmoji('➖').setDisabled(false)
            );

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
            const patients = await sqlFollowOrgan.getPatients();
            const startTxt = '```ansi\n';
            let fullTxt = '';
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

            const firstMsg = await channel.send({ embeds: [emb.generate(`Organes`, null, null, process.env.LSMS_COLORCODE, null, null, null, null, null, null, null, false)] });
            await channel.send({ embeds: [emb.generate(null, null, `**Sains** - ${totalAvailableNumLungs + totalAvailableNumKidney + totalAvailableNumLiver}`, process.env.LSMS_COLORCODE, null, null, null, null, null, null, null, false)] });
            await channel.send({ content: availableLungs + availableKidney + availableLiver });
            await channel.send({ embeds: [emb.generate(null, null, `**Non sains (à détruire)** - ${totalExpiredNumLungs + totalExpiredNumKidney + totalExpiredNumLiver}`, process.env.LSMS_COLORCODE, null, null, null, null, null, null, null, false)] });
            await channel.send({ content: expiredLungs + expiredKidney + expiredLiver });
            await channel.send({ embeds: [emb.generate(null, null, `**Total** - ${totalAvailableNumLungs + totalExpiredNumLungs + totalAvailableNumKidney + totalExpiredNumKidney + totalAvailableNumLiver + totalExpiredNumLiver}`, process.env.LSMS_COLORCODE, null, null, null, null, null, null, null, false)] });
            await channel.send({ content: totalLungs + totalKidney + totalLiver });
            await channel.send({ embeds: [emb.generate(null, null, `**En attente de greffe** - ${patients.length}`, process.env.LSMS_COLORCODE, null, null, null, null, null, null, null, false)] });
            await channel.send({ content: fullTxt, components: [btns] });
            //await channel.send({ content: '\u200b\n\u200b\n\u200b\n\u200b\n\u200b' });
            await firstMsg.pin();
            await channel.messages.fetch({ limit: 1 }).then(async msg => {
                let lastMessage = msg.first();

                if (lastMessage.author.bot) {
                    await lastMessage.delete();
                }
            }).catch(logger.error);
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
        stringToEdit = stringToEdit + '[2;36m0[0m';
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
        stringToEdit = stringToEdit + '[2;36m0[0m';
    } else {
        for(i=0;i<organArray.length;i++) {
            //Date format
            let formatedDate = formatDate(organArray[i].expire_date);

            if(organArray.length == 1) {
                stringToEdit = stringToEdit + `[2;36m1[0m[2;35mG[0m [2;37m([0m[2;34m${formatedDate}[0m[2;37m)[0m`;
            } else {
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

        }
        let lastSeparatorIndex;
        for(j=0;j<stringToEdit.length;j++) {
            if(stringToEdit.charAt(j) == '|') {
                lastSeparatorIndex = j;
            }
        }
        stringToEdit = stringToEdit.slice(0, lastSeparatorIndex-1);
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