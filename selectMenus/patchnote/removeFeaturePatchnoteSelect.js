//Récup du logger
const logger = require('../../modules/logger');
//Récup du créateur d'embed
const emb = require('../../modules/embeds');
//Fonction pour attendre
const wait = require('node:timers/promises').setTimeout;
//Récupération du module sql pour les patchnotes
const patchnoteSQL = require('../../sql/patchnote/patchnote');
//Récupération du module sql pour les features
const featureSQL = require('../../sql/patchnote/feature');

module.exports = {
    execute: async function (interaction, errEmb) {
        //Confirmation à Discord du succès de l'opération
        await interaction.deferReply({ ephemeral: true });
        //Récupération des features
        let oldFeatures = await patchnoteSQL.getLastPatchnote();
        let features = oldFeatures.features_id.split(";")
        for (i=0;i<interaction.values.length;i++) {
            if(features.includes(interaction.values[i])) {
                features.splice(features.indexOf(interaction.values[i]), 1)
                featureSQL.updateState(interaction.values[i], 0)
            }
        }
        features = features.join(";")
        await patchnoteSQL.addFeatureToLastPatchnote(features);
        interaction.followUp({ embeds: [emb.generate(null, null, `Les features ${features} sont présentes dans le dernier patchnote !`, `#0DE600`, process.env.LSMS_LOGO_V2, null, `Gestion des features`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, true)], ephemeral: true });
        // Supprime la réponse après 5s
        await wait(5000);
        await interaction.deleteReply();
    }
}