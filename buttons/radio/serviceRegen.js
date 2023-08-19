//Récup du logger
const logger = require('../../modules/logger');
//Récup du créateur d'embed
const emb = require('../../modules/embeds');
//Fonction pour attendre
const wait = require('node:timers/promises').setTimeout;
//Récup du modificateur de radio
const radio = require('../../modules/changeRadio');
//Récup du WS pour MAJ les radios
const radioServer = require('../../modules/commonRadioServer');

const serviceID = process.env.IRIS_SERVICE_ROLE_ID;

module.exports = {
    execute: async function(interaction, errEmb) {
        if(interaction.member.roles.cache.has(serviceID)) {
            if(interaction.customId == 'regenLSMS' || interaction.customId == 'regenEvent' ) {
                //Generation aléatoire de la radio entre 250.0 et 344.9
                const freqUnit = Math.floor(Math.random() * (344-250+1)) + 250;
                const freqDeci = Math.floor(Math.random() * 10);
                const freq = freqUnit + '.' + freqDeci;
                if(interaction.customId == 'regenLSMS') { logger.logRadio('LSMS', freq); }
                if(interaction.customId == 'regenEvent') { logger.logRadio('Event', freq); }
                radio.change(interaction.client, interaction.customId, freq, true);
            }
            if(interaction.customId == 'regenFDO') {
                radioServer.askRefresh('lsms-lspd-lscs');
            }
            if(interaction.customId == 'regenBCMS') {
                radioServer.askRefresh('lsms-bcms');
            }
            //Confirmation à Discord du succès de l'opération
            await interaction.deferUpdate();
        } else {
            await interaction.reply({ embeds: [emb.generate(`Action impossible !`, null, `Désolé, vous devez être en service pour régénérer une radio !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, null, null, null, interaction.client.user.username, interaction.client.user.avatarURL(), true)], ephemeral: true });
            // Supprime la réponse après 5s
            await wait(5000);
            await interaction.deleteReply();
        }
    }
}