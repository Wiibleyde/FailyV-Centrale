//Récup du logger
const logger = require('../../modules/logger');
//Récup du créateur d'embed
const emb = require('../../modules/embeds');
//Fonction pour attendre
const wait = require('node:timers/promises').setTimeout;
//Récupération du module sql pour les features
const featureSQL = require('../../sql/patchnote/feature');

module.exports = {
    execute: async function (interaction, errEmb) {
        //Confirmation à Discord du succès de l'opération
        await interaction.deferReply({ ephemeral: true });

        let features = ""
        for (i=0;i<interaction.values.length;i++) {
            const feature = interaction.values[i]
            await featureSQL.deleteFeature(feature)
            if(i < interaction.values.length) {
                features = features + feature + ", "
            } else {
                features = features + feature
            }
        }
        if(interaction.values.length > 1) {
            interaction.followUp({ embeds: [emb.generate(null, null, `Les features ${features} ont bien été supprimées de la liste des features !`, `#0DE600`, process.env.LSMS_LOGO_V2, null, `Gestion des features`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, true)], ephemeral: true });
        } else {
            interaction.followUp({ embeds: [emb.generate(null, null, `La feature ${features} a bien été supprimée de la liste des features !`, `#0DE600`, process.env.LSMS_LOGO_V2, null, `Gestion des features`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, true)], ephemeral: true });
        }
        // Supprime la réponse après 5s
        await wait(5000);
        await interaction.deleteReply();
    }
}