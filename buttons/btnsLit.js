//Récup du logger
const logger = require('./../modules/logger');
//Récup du créateur d'embed
const emb = require('./../modules/embeds');
//Récup des reqêtes SQL des lits pour retirer le patient
const beds = require('./../sql/lit');
//Fonction pour régénérer l'image des lits
const img = require('./../modules/writeBed');
//Récup du service
const service = require('./../modules/service');
//Fonction pour attendre
const wait = require('node:timers/promises').setTimeout;
//Récup des réactions
const btnCreator = require('./../modules/btnCreator');


module.exports = {
    execute: async function(interaction, errEmb) {
        if(!service.isGen()) {
            await interaction.deferReply({ ephemeral: true });
            const letter = interaction.customId;

            service.setGen(true);
            await beds.remove(letter);

            let lits = await beds.get();
            let patient = [];
            let patientLetter = [];
            let patientSurveilance = [];
            for(i=0;i<lits.length;i++) {
                patient.push(lits[i].patient);
                patientLetter.push(lits[i].letter);
                patientSurveilance.push(lits[i].surveillance);
            }
            const imgMsg = await img.write(patient, patientLetter, patientSurveilance, interaction.client);
            let imgUrl;
            imgMsg.attachments.map(bedImg => imgUrl = bedImg.attachment);

            let letters = await beds.getLetters();
            editBedsImage(letters, interaction.message, imgUrl, interaction);
        } else {
            await interaction.reply({ embeds: [emb.generate(null, null, `L'aperçu de la salle de réveil est déjà en cours de mise à jour, veuillez patienter quelques secondes !`, `#FEAC12`, process.env.LSMS_LOGO_V2, null, `Gestion de la salle de réveil`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).icon}.webp`, null, null, null, true)], ephemeral: true });
            // Supprime la réponse après 5s
            await wait(5000);
            await interaction.deleteReply();
        }
    }
}


async function editBedsImage(letters, d, imgUrl, interaction) {
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
        await interaction.followUp({ embeds: [emb.generate(null, null, `Aperçu de la salle de réveil mis à jour !`, `#0DE600`, process.env.LSMS_LOGO_V2, null, `Gestion de la salle de réveil`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).icon}.webp`, null, null, null, true)], ephemeral: true });
        await wait(1000);
        service.setGen(false);
        // Supprime la réponse après 5s
        await wait(5000);
        await interaction.deleteReply();
    } else if(letters.length < 6) {
        const btns1 = btnCreator.genBedsBtns(lettersArray1);
        await d.edit({ content: imgUrl, components: [btns1] });
        await interaction.followUp({ embeds: [emb.generate(null, null, `Aperçu de la salle de réveil mis à jour !`, `#0DE600`, process.env.LSMS_LOGO_V2, null, `Gestion de la salle de réveil`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).icon}.webp`, null, null, null, true)], ephemeral: true });
        await wait(1000);
        service.setGen(false);
        // Supprime la réponse après 5s
        await wait(5000);
        await interaction.deleteReply();
        service.setGen(false);
    } else if(letters.length < 11) {
        const btns1 = btnCreator.genBedsBtns(lettersArray1);
        const btns2 = btnCreator.genBedsBtns(lettersArray2);
        await d.edit({ content: imgUrl, components: [btns1, btns2] });
        await interaction.followUp({ embeds: [emb.generate(null, null, `Aperçu de la salle de réveil mis à jour !`, `#0DE600`, process.env.LSMS_LOGO_V2, null, `Gestion de la salle de réveil`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).icon}.webp`, null, null, null, true)], ephemeral: true });
        await wait(1000);
        service.setGen(false);
        // Supprime la réponse après 5s
        await wait(5000);
        await interaction.deleteReply();
        service.setGen(false);
    } else if(letters.length < 16) {
        const btns1 = btnCreator.genBedsBtns(lettersArray1);
        const btns2 = btnCreator.genBedsBtns(lettersArray2);
        const btns3 = btnCreator.genBedsBtns(lettersArray3);
        await d.edit({ content: imgUrl, components: [btns1, btns2, btns3] });
        await interaction.followUp({ embeds: [emb.generate(null, null, `Aperçu de la salle de réveil mis à jour !`, `#0DE600`, process.env.LSMS_LOGO_V2, null, `Gestion de la salle de réveil`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).icon}.webp`, null, null, null, true)], ephemeral: true });
        await wait(1000);
        service.setGen(false);
        // Supprime la réponse après 5s
        await wait(5000);
        await interaction.deleteReply();
        service.setGen(false);
    } else if(letters.length < 21) {
        const btns1 = btnCreator.genBedsBtns(lettersArray1);
        const btns2 = btnCreator.genBedsBtns(lettersArray2);
        const btns3 = btnCreator.genBedsBtns(lettersArray3);
        const btns4 = btnCreator.genBedsBtns(lettersArray4);
        await d.edit({ content: imgUrl, components: [btns1, btns2, btns3, btns4] });
        await interaction.followUp({ embeds: [emb.generate(null, null, `Aperçu de la salle de réveil mis à jour !`, `#0DE600`, process.env.LSMS_LOGO_V2, null, `Gestion de la salle de réveil`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).icon}.webp`, null, null, null, true)], ephemeral: true });
        await wait(1000);
        service.setGen(false);
        // Supprime la réponse après 5s
        await wait(5000);
        await interaction.deleteReply();
        service.setGen(false);
    }
}