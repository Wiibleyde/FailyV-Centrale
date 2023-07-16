//Récup du logger
const logger = require('../modules/logger');
//Récup du créateur d'embed
const emb = require('../modules/embeds');
//Fonction pour attendre
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    execute: async function(interaction, errEmb) {
        const message = interaction.message;
        //Suppression du message
        await message.delete();
        //Envoi du message de confirmation ephemeral
        await interaction.reply({ content: `Le rendez-vous a bien été terminé.`, ephemeral: true });
        // Supprime la réponse après 5s
        await wait(5000);
        await interaction.deleteReply();
    }
}