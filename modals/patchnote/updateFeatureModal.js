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
        const serverIcon = `https://cdn.discordapp.com/icons/${interaction.guild.id}/${interaction.guild.icon}.webp`;
        const authorTitleEmbed = `Gestion des features`;
        const type = interaction.components[0].components[0].value
        const title = interaction.components[1].components[0].value
        const feature = interaction.components[2].components[0].value
        const id = interaction.components[3].components[0].value
        await featureSQL.updateFeature(id, type, title, feature)
        await interaction.reply({ embeds: [emb.generate(`Succès !`, null, `La feature a bien été modifiée.`, `#00FF00`, process.env.LSMS_LOGO_V2, null, authorTitleEmbed, serverIcon, null, null, null, false)], ephemeral: true });
    }
}