//Récupération des fonctions pour créer une commande
const { SlashCommandBuilder } = require('discord.js');
//Récup du logger
const logger = require('./../../modules/logger');
//Récup des reqêtes SQL pour les lits
const beds = require('./../../sql/lit');
//Fonction pour attendre
const wait = require('node:timers/promises').setTimeout;
//Fonction pour régénérer l'image des lits
const img = require('./../../modules/writeBed');
//Récup du créateur d'embed
const emb = require('./../../modules/embeds');
//Récup du service
const service = require('./../../modules/service');
//Récup des réactions
const btnCreator = require('./../../modules/btnCreator');

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
            .setDescription('Est ce que le patient est en surveillance FDO ?')
            .setRequired(false)
            .addChoices(
                { name: 'Oui', value: '1' },
                { name: 'Non', value: '0' }
            )
        ),
    async execute(interaction) {
        if(!service.isGen()) {
            await interaction.deferReply({ ephemeral: true });
            let surveillance;
            if(interaction.options.getString('surveillance') != null) {
                surveillance = interaction.options.getString('surveillance');
            } else {
                surveillance = '0';
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
                if(!patient.includes(interaction.options.getString('patient').toLowerCase())) {
                    patient.push(interaction.options.getString('patient').toLowerCase());
                    patientLetter.push(interaction.options.getString('lettre'));
                    patientSurveilance.push(surveillance);
                    genLits(interaction, interaction.options.getString('patient').toLowerCase(), interaction.options.getString('lettre'), surveillance, patient, patientLetter, patientSurveilance);
                } else {
                    let patientIndex = patient.indexOf(interaction.options.getString('patient').toLowerCase());
                    if(patientLetter[patientIndex] != interaction.options.getString('lettre') || patientSurveilance[patientIndex] != surveillance) {
                        patientLetter[patientIndex] = interaction.options.getString('lettre');
                        patientSurveilance[patientIndex] = surveillance;
                        changePatientBed(interaction, interaction.options.getString('patient').toLowerCase(), interaction.options.getString('lettre'), surveillance, patient, patientLetter, patientSurveilance);
                    } else {
                        await interaction.followUp({ embeds: [emb.generate(null, null, `Désolé, ce patient est déjà placé dans le lit **${patientLetter[patientIndex].toUpperCase()}** !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, `Gestion de la salle de réveil`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).icon}.webp`, null, null, null, true)], ephemeral: true });
                        // Supprime la réponse après 5s
                        await wait(5000);
                        await interaction.deleteReply();
                    }
                }
            } else {
                genLits(interaction, interaction.options.getString('patient').toLowerCase(), interaction.options.getString('lettre'), surveillance, [interaction.options.getString('patient').toLowerCase()], [interaction.options.getString('lettre')], [surveillance]);
            }
        } else {
            await interaction.reply({ embeds: [emb.generate(null, null, `L'aperçu de la salle de réveil est déjà en cours de mise à jour, veuillez patienter quelques secondes !`, `#FEAC12`, process.env.LSMS_LOGO_V2, null, `Gestion de la salle de réveil`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).icon}.webp`, null, null, null, true)], ephemeral: true });
            // Supprime la réponse après 5s
            await wait(5000);
            await interaction.deleteReply();
        }
    },
};

async function genLits(interaction, newPatient, newPatientLetter, newPatientSurveillance, patientList, patientLetters, patientSurveillance) {
    service.setGen(true);
    await beds.add(newPatient, newPatientLetter, newPatientSurveillance);
    const imgMsg = await img.write(patientList, patientLetters, patientSurveillance, interaction.client);
    let imgUrl;
    imgMsg.attachments.map(bedImg => imgUrl = bedImg.attachment);
    interaction.client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).channels.cache.get(process.env.IRIS_RADIO_CHANNEL_ID).messages.fetch().then(messages => {
        messages.map(async d => {
            if(d.embeds[0].url != null) {
                let letters = await beds.getLetters();
                editBedsImage(letters, d, imgUrl);
                await interaction.followUp({ embeds: [emb.generate(null, null, `Aperçu de la salle de réveil mis à jour !`, `#0DE600`, process.env.LSMS_LOGO_V2, null, `Gestion de la salle de réveil`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).icon}.webp`, null, null, null, true)], ephemeral: true });
                // Supprime la réponse après 5s
                await wait(5000);
                await interaction.deleteReply();
            }
        });
    });
}

async function changePatientBed(interaction, newPatient, newPatientLetter, newPatientSurveillance, patientList, patientLetters, patientSurveillance) {
    service.setGen(true);
    await beds.update(newPatient, newPatientLetter, newPatientSurveillance);
    const imgMsg = await img.write(patientList, patientLetters, patientSurveillance, interaction.client);
    let imgUrl;
    imgMsg.attachments.map(bedImg => imgUrl = bedImg.attachment);
    interaction.client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).channels.cache.get(process.env.IRIS_RADIO_CHANNEL_ID).messages.fetch().then(messages => {
        messages.map(async d => {
            if(d.embeds[0].url != null) {
                let letters = await beds.getLetters();
                editBedsImage(letters, d, imgUrl);
                await interaction.followUp({ embeds: [emb.generate(null, null, `Aperçu de la salle de réveil mis à jour !`, `#0DE600`, process.env.LSMS_LOGO_V2, null, `Gestion de la salle de réveil`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).icon}.webp`, null, null, null, true)], ephemeral: true });
                // Supprime la réponse après 5s
                await wait(5000);
                await interaction.deleteReply();
            }
        });
    });
}

async function editBedsImage(letters, d, imgUrl) {
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
    if(letters.length < 6) {
        const btns1 = btnCreator.genBedsBtns(lettersArray1);
        await d.edit({ content: imgUrl, components: [btns1] });
        service.setGen(false);
    } else if(letters.length < 11) {
        const btns1 = btnCreator.genBedsBtns(lettersArray1);
        const btns2 = btnCreator.genBedsBtns(lettersArray2);
        await d.edit({ content: imgUrl, components: [btns1, btns2] });
        service.setGen(false);
    } else if(letters.length < 16) {
        const btns1 = btnCreator.genBedsBtns(lettersArray1);
        const btns2 = btnCreator.genBedsBtns(lettersArray2);
        const btns3 = btnCreator.genBedsBtns(lettersArray3);
        await d.edit({ content: imgUrl, components: [btns1, btns2, btns3] });
        service.setGen(false);
    } else if(letters.length < 21) {
        const btns1 = btnCreator.genBedsBtns(lettersArray1);
        const btns2 = btnCreator.genBedsBtns(lettersArray2);
        const btns3 = btnCreator.genBedsBtns(lettersArray3);
        const btns4 = btnCreator.genBedsBtns(lettersArray4);
        await d.edit({ content: imgUrl, components: [btns1, btns2, btns3, btns4] });
        service.setGen(false);
    }
}