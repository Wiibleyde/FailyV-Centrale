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
        const type = interaction.components[0].components[0].value
        const title = interaction.components[1].components[0].value
        const feature = interaction.components[2].components[0].value
        const testTitle = await featureSQL.testTitle(title)
        if (testTitle) {
            await interaction.reply({ embeds: [emb.generate(`Erreur :(`, null, `Attention, le titre de feature que vous avez entré existe déjà dans les non envoyées.`, `#FF0000`, process.env.LSMS_LOGO_V2, null, `Gestion des features`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });
            await wait(5000);
            return await interaction.deleteReply();
        }
        await featureSQL.addFeature(type, title, feature)
        await interaction.reply({ embeds: [emb.generate(`Succès !`, null, `La feature a bien été ajoutée.`, `#00FF00`, process.env.LSMS_LOGO_V2, null, `Gestion des features`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });
    }
}