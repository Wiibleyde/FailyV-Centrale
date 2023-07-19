//Récup du logger
const logger = require('./../modules/logger');
//Récup du créateur d'embed
const emb = require('./../modules/embeds');
//Fonction pour attendre
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    execute: async function(interaction, errEmb) {
        //Get in the message the number of times the person has been contacted (embed = const rendezVousEmb = emb.generate(null, null, `**Nom et prénom:** ${nomPrenom}\n**Numéro de téléphone:** ${numero}\n**Description:** ${description}\n**Contacté:** 0 fois\n**Pris par:** ${pseudo}`, `#FF0000`, `https://cdn.discordapp.com/attachments/1083724872045297734/1124914370217005127/LSMS.png`, null, `Rendez-vous ${type}`, `https://cdn.discordapp.com/attachments/1083724872045297734/1124914370217005127/LSMS.png`, null, null, null, false);)
        const rendezVousEmb = interaction.message.embeds[0];
        const contacte = rendezVousEmb.description.split('**Contacté:** ')[1].split(' fois')[0];
        //Modify embed to add 1 to the number of times the person has been contacted
        rendezVousEmb.description = rendezVousEmb.description.replace(`**Contacté:** ${contacte}`, `**Contacté:** ${parseInt(contacte) + 1}`);
        //Modify the message to update the embed
        await interaction.message.edit({ embeds: [rendezVousEmb] });
        //Send confirmation message
        await interaction.reply({ content: `La personne a bien été contactée.`, ephemeral: true });
        // Supprime la réponse après 5s
        await wait(5000);
        await interaction.deleteReply();
    }
}
