//Récup du logger
const logger = require('../../modules/logger');
//Récup du créateur d'embed
const emb = require('../../modules/embeds');
//Fonction pour attendre
const wait = require('node:timers/promises').setTimeout;
//Récupération du module sql pour les features
const patchnoteSQL = require('../../sql/patchnote/patchnote');

module.exports = {
    execute: async function (interaction, errEmb) {
        const name = interaction.components[0].components[0].value
        const version = interaction.components[1].components[0].value
        await patchnoteSQL.createPatchnote(name, version)
        await interaction.reply({ embeds: [emb.generate(`Succès !`, null, `La patchnote a bien été ajoutée.`, `#00FF00`, process.env.LSMS_LOGO_V2, null, `Gestion des patchnotes`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });
    }
}