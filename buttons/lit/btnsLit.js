//Récup du logger
const logger = require('../../modules/logger');
//Récup du créateur d'embed
const emb = require('../../modules/embeds');
//Récup des reqêtes SQL des lits pour retirer le patient
const beds = require('../../sql/lit/lit');
//Fonction pour régénérer l'image des lits
const img = require('../../modules/writeBed');
//Récup du service
const service = require('../../modules/service');
//Fonction pour attendre
const wait = require('node:timers/promises').setTimeout;
//Récup des réactions
const btnCreator = require('../../modules/btnCreator');
//SQL Init
const sql = require('../../sql/config/config');


module.exports = {
    execute: async function(interaction, errEmb) {
        if(!service.isGen()) {
            await interaction.deferReply({ ephemeral: true });
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
            const getMsgId = await beds.getMessageId('lit');
            const msgId = getMsgId[0].id;
            const getBCMSMsgId = await beds.getMessageId('lit_bcms');
            const bcmsMsgId = getBCMSMsgId[0].id;
            const radioMsg = await radioChannel.messages.fetch(msgId);
            const bcmsMsg = await bcmsThread.messages.fetch(bcmsMsgId);

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
            editBedsImage(letters, radioMsg, bcmsMsg, imgUrl, interaction);
        } else {
            await interaction.reply({ embeds: [emb.generate(null, null, `L'aperçu de la salle de réveil est déjà en cours de mise à jour, veuillez patienter quelques secondes !`, `#FEAC12`, process.env.LSMS_LOGO_V2, null, `Gestion de la salle de réveil`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, true)], ephemeral: true });
            // Supprime la réponse après 5s
            await wait(5000);
            await interaction.deleteReply();
        }
    }
}


async function editBedsImage(letters, d, bcmsMsg, imgUrl, interaction) {
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
        await interaction.followUp({ embeds: [emb.generate(null, null, `Aperçu de la salle de réveil mis à jour !`, `#0DE600`, process.env.LSMS_LOGO_V2, null, `Gestion de la salle de réveil`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, true)], ephemeral: true });
        service.setGen(false);
        // Supprime la réponse après 5s
        await wait(5000);
        await interaction.deleteReply();
    } else if(letters.length < 6) {
        const btns1 = btnCreator.genBedsBtns(lettersArray1);
        await d.edit({ content: imgUrl, components: [btns1] });
        await bcmsMsg.edit({ content: imgUrl, components: [btns1] });
        await interaction.followUp({ embeds: [emb.generate(null, null, `Aperçu de la salle de réveil mis à jour !`, `#0DE600`, process.env.LSMS_LOGO_V2, null, `Gestion de la salle de réveil`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, true)], ephemeral: true });
        service.setGen(false);
        // Supprime la réponse après 5s
        await wait(5000);
        await interaction.deleteReply();
    } else if(letters.length < 11) {
        const btns1 = btnCreator.genBedsBtns(lettersArray1);
        const btns2 = btnCreator.genBedsBtns(lettersArray2);
        await d.edit({ content: imgUrl, components: [btns1, btns2] });
        await bcmsMsg.edit({ content: imgUrl, components: [btns1, btns2] });
        await interaction.followUp({ embeds: [emb.generate(null, null, `Aperçu de la salle de réveil mis à jour !`, `#0DE600`, process.env.LSMS_LOGO_V2, null, `Gestion de la salle de réveil`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, true)], ephemeral: true });
        service.setGen(false);
        // Supprime la réponse après 5s
        await wait(5000);
        await interaction.deleteReply();
    } else if(letters.length < 16) {
        const btns1 = btnCreator.genBedsBtns(lettersArray1);
        const btns2 = btnCreator.genBedsBtns(lettersArray2);
        const btns3 = btnCreator.genBedsBtns(lettersArray3);
        await d.edit({ content: imgUrl, components: [btns1, btns2, btns3] });
        await bcmsMsg.edit({ content: imgUrl, components: [btns1, btns2, btns3] });
        await interaction.followUp({ embeds: [emb.generate(null, null, `Aperçu de la salle de réveil mis à jour !`, `#0DE600`, process.env.LSMS_LOGO_V2, null, `Gestion de la salle de réveil`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, true)], ephemeral: true });
        service.setGen(false);
        // Supprime la réponse après 5s
        await wait(5000);
        await interaction.deleteReply();
    } else if(letters.length < 21) {
        const btns1 = btnCreator.genBedsBtns(lettersArray1);
        const btns2 = btnCreator.genBedsBtns(lettersArray2);
        const btns3 = btnCreator.genBedsBtns(lettersArray3);
        const btns4 = btnCreator.genBedsBtns(lettersArray4);
        await d.edit({ content: imgUrl, components: [btns1, btns2, btns3, btns4] });
        await bcmsMsg.edit({ content: imgUrl, components: [btns1, btns2, btns3, btns4] });
        await interaction.followUp({ embeds: [emb.generate(null, null, `Aperçu de la salle de réveil mis à jour !`, `#0DE600`, process.env.LSMS_LOGO_V2, null, `Gestion de la salle de réveil`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, true)], ephemeral: true });
        service.setGen(false);
        // Supprime la réponse après 5s
        await wait(5000);
        await interaction.deleteReply();
    }
}