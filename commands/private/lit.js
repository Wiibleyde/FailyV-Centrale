//Récupération des fonctions pour créer une commande
const { SlashCommandBuilder } = require('discord.js');
//Récup du logger
const logger = require('../../modules/logger');
//Récup des reqêtes SQL pour les lits
const beds = require('../../sql/lit/lit');
//Fonction pour attendre
const wait = require('node:timers/promises').setTimeout;
//Fonction pour régénérer l'image des lits
const img = require('../../modules/writeBed');
//Récup du créateur d'embed
const emb = require('../../modules/embeds');
//Récup du service
const service = require('../../modules/service');
//Récup des réactions
const btnCreator = require('../../modules/btnCreator');
//SQL Init
const sql = require('../../sql/config/config');

module.exports = {
    //Création de la commande
    data: new SlashCommandBuilder()
        .setName('lit')
        .setDescription('Ajouter un patient sur un lit')
        .addStringOption(option => 
            option.setName('patient')
            .setDescription('Prénom Nom')
            .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('lettre')
            .setDescription('Sélectionnez la lettre du lit où se trouve le patient')
            .setRequired(true)
            .addChoices(
                { name: 'A', value: 'a' },
                { name: 'B', value: 'b' },
                { name: 'C', value: 'c' },
                { name: 'D', value: 'd' },
                { name: 'E', value: 'e' },
                { name: 'F', value: 'f' },
                { name: 'G', value: 'g' },
                { name: 'H', value: 'h' },
                { name: 'I', value: 'i' },
                { name: 'J', value: 'j' },
                { name: 'K', value: 'k' },
                { name: 'L', value: 'l' },
                { name: 'M', value: 'm' },
                { name: 'N', value: 'n' },
                { name: 'O', value: 'o' },
                { name: 'P', value: 'p' },
                { name: 'Q', value: 'q' },
                { name: 'R', value: 'r' }
            )
        )
        .addStringOption(option => 
            option.setName('surveillance')
            .setDescription('Est ce que le patient est sous surveillance des FDO ?')
            .setRequired(false)
            .addChoices(
                { name: 'Oui', value: '1' },
                { name: 'Non', value: '0' }
            )
        ),
    async execute(interaction) {
        let IRIS_RADIO_CHANNEL_ID = await sql.getChannel('IRIS_RADIO_CHANNEL_ID');
        let IRIS_BCMS_BEDS_THREAD_ID = await sql.getChannel('bcms_beds_thread');
        if(IRIS_RADIO_CHANNEL_ID[0] == null || IRIS_BCMS_BEDS_THREAD_ID[0] == null) {
            await interaction.followUp({ embeds: [emb.generate(null, null, `Désolé, le salon centrale ou BCMS n'est pas configuré !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, `Gestion de la salle de réveil`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${guild.icon}.webp`, null, null, null, true)], ephemeral: true });
            // Supprime la réponse après 5s
            await wait(5000);
            await interaction.deleteReply();
            return;
        }
        let radioChannel = interaction.guild.channels.cache.get(IRIS_RADIO_CHANNEL_ID[0].id);
        let bcmsThread = interaction.guild.channels.cache.get(IRIS_BCMS_BEDS_THREAD_ID[0].id);
        const guild = interaction.guild;
        if(!service.isGen()) {
            await interaction.deferReply({ ephemeral: true });
            const getMsgId = await beds.getMessageId('lit');
            const msgId = getMsgId[0].id;
            const getBCMSMsgId = await beds.getMessageId('lit_bcms');
            const bcmsMsgId = getBCMSMsgId[0].id;
            let surveillance = '0';
            if(interaction.options.getString('surveillance') != null) {
                surveillance = interaction.options.getString('surveillance');
            }
            let lits = await beds.get();
            if(lits.length > 0) {
                //service.setGen(true);
                let patient = [];
                let patientLetter = [];
                let patientSurveilance = [];
                for(i=0;i<lits.length;i++) {
                    patient.push(lits[i].patient);
                    patientLetter.push(lits[i].letter);
                    patientSurveilance.push(lits[i].surveillance);
                }
                if(patientLetter.indexOf(interaction.options.getString('lettre')) == '-1') {
                    if(!patient.includes(interaction.options.getString('patient').toLowerCase())) {
                            patient.push(interaction.options.getString('patient').toLowerCase());
                            patientLetter.push(interaction.options.getString('lettre'));
                            patientSurveilance.push(surveillance);
                            genLits(guild, radioChannel, bcmsThread, msgId, bcmsMsgId, interaction, interaction.options.getString('patient').toLowerCase(), interaction.options.getString('lettre'), surveillance, patient, patientLetter, patientSurveilance);
                    } else {
                        let patientIndex = patient.indexOf(interaction.options.getString('patient').toLowerCase());
                        if(patientLetter[patientIndex] != interaction.options.getString('lettre') || patientSurveilance[patientIndex] != surveillance) {
                            patientLetter[patientIndex] = interaction.options.getString('lettre');
                            patientSurveilance[patientIndex] = surveillance;
                            changePatientBed(guild, radioChannel, bcmsThread, msgId, bcmsMsgId, interaction, interaction.options.getString('patient').toLowerCase(), interaction.options.getString('lettre'), surveillance, patient, patientLetter, patientSurveilance);
                        } else {
                            await interaction.followUp({ embeds: [emb.generate(null, null, `Désolé, ce patient est déjà placé dans le lit **${patientLetter[patientIndex].toUpperCase()}** !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, `Gestion de la salle de réveil`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${guild.icon}.webp`, null, null, null, true)], ephemeral: true });
                            // Supprime la réponse après 5s
                            await wait(5000);
                            await interaction.deleteReply();
                        }
                    }
                } else {
                    await interaction.followUp({ embeds: [emb.generate(null, null, `Désolé, il y a déjà un patient dans ce lit, veuillez essayer un autre lit !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, `Gestion de la salle de réveil`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${guild.icon}.webp`, null, null, null, true)], ephemeral: true });
                    // Supprime la réponse après 5s
                    await wait(5000);
                    await interaction.deleteReply();
                }
            } else {
                genLits(guild, radioChannel, bcmsThread, msgId, bcmsMsgId, interaction, interaction.options.getString('patient').toLowerCase(), interaction.options.getString('lettre'), surveillance, [interaction.options.getString('patient').toLowerCase()], [interaction.options.getString('lettre')], [surveillance]);
            }
        } else {
            await interaction.reply({ embeds: [emb.generate(null, null, `L'aperçu de la salle de réveil est déjà en cours de mise à jour, veuillez patienter quelques secondes !`, `#FEAC12`, process.env.LSMS_LOGO_V2, null, `Gestion de la salle de réveil`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${guild.icon}.webp`, null, null, null, true)], ephemeral: true });
            // Supprime la réponse après 5s
            await wait(5000);
            await interaction.deleteReply();
        }
    },
};

async function genLits(guild, radioChannel, bcmsThread, msgId, bcmsMsgId, interaction, newPatient, newPatientLetter, newPatientSurveillance, patientList, patientLetters, patientSurveillance) {
    service.setGen(true);
    await beds.add(newPatient, newPatientLetter, newPatientSurveillance);
    const imgMsg = await img.write(patientList, patientLetters, patientSurveillance, interaction.client);
    let imgUrl;
    imgMsg.attachments.map(bedImg => imgUrl = bedImg.attachment);
    const messageToEdit = await radioChannel.messages.fetch(msgId);
    const messageToEditBCMS = await bcmsThread.messages.fetch(bcmsMsgId);
    if(messageToEdit.embeds[0].url != null && messageToEditBCMS.embeds[0].url != null) {
        editBedsImage(messageToEdit, messageToEditBCMS, imgUrl);
        await interaction.followUp({ embeds: [emb.generate(null, null, `Aperçu de la salle de réveil mis à jour !`, `#0DE600`, process.env.LSMS_LOGO_V2, null, `Gestion de la salle de réveil`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${guild.icon}.webp`, null, null, null, true)], ephemeral: true });
        service.setGen(false);
        // Supprime la réponse après 5s
        await wait(5000);
        await interaction.deleteReply();
    }
}

async function changePatientBed(guild, radioChannel, bcmsThread, msgId, bcmsMsgId, interaction, newPatient, newPatientLetter, newPatientSurveillance, patientList, patientLetters, patientSurveillance) {
    service.setGen(true);
    await beds.update(newPatient, newPatientLetter, newPatientSurveillance);
    const imgMsg = await img.write(patientList, patientLetters, patientSurveillance, interaction.client);
    let imgUrl;
    imgMsg.attachments.map(bedImg => imgUrl = bedImg.attachment);
    const messageToEdit = await radioChannel.messages.fetch(msgId);
    const messageToEditBCMS = await bcmsThread.messages.fetch(bcmsMsgId);
    if(messageToEdit.embeds[0].url != null && messageToEditBCMS.embeds[0].url != null) {
        editBedsImage(messageToEdit, messageToEditBCMS, imgUrl);
        await interaction.followUp({ embeds: [emb.generate(null, null, `Aperçu de la salle de réveil mis à jour !`, `#0DE600`, process.env.LSMS_LOGO_V2, null, `Gestion de la salle de réveil`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${guild.icon}.webp`, null, null, null, true)], ephemeral: true });
        service.setGen(false);
        // Supprime la réponse après 5s
        await wait(5000);
        await interaction.deleteReply();
    }
}

async function editBedsImage(d, bcmsMsg, imgUrl) {
    let letters = await beds.getLetters();
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
        await d.edit({ content: imgUrl, components: [] });
        await bcmsMsg.edit({ content: imgUrl, components: [] });
    } else if(letters.length < 6) {
        const btns1 = btnCreator.genBedsBtns(lettersArray1);
        await d.edit({ content: imgUrl, components: [btns1] });
        await bcmsMsg.edit({ content: imgUrl, components: [btns1] });
    } else if(letters.length < 11) {
        const btns1 = btnCreator.genBedsBtns(lettersArray1);
        const btns2 = btnCreator.genBedsBtns(lettersArray2);
        await d.edit({ content: imgUrl, components: [btns1, btns2] });
        await bcmsMsg.edit({ content: imgUrl, components: [btns1, btns2] });
    } else if(letters.length < 16) {
        const btns1 = btnCreator.genBedsBtns(lettersArray1);
        const btns2 = btnCreator.genBedsBtns(lettersArray2);
        const btns3 = btnCreator.genBedsBtns(lettersArray3);
        await d.edit({ content: imgUrl, components: [btns1, btns2, btns3] });
        await bcmsMsg.edit({ content: imgUrl, components: [btns1, btns2, btns3] });
    } else if(letters.length < 21) {
        const btns1 = btnCreator.genBedsBtns(lettersArray1);
        const btns2 = btnCreator.genBedsBtns(lettersArray2);
        const btns3 = btnCreator.genBedsBtns(lettersArray3);
        const btns4 = btnCreator.genBedsBtns(lettersArray4);
        await d.edit({ content: imgUrl, components: [btns1, btns2, btns3, btns4] });
        await bcmsMsg.edit({ content: imgUrl, components: [btns1, btns2, btns3, btns4] });
    }
}