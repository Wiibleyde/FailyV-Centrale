//Récup du logger
const logger = require('../../modules/logger');
//Récup des requêtes SQL
const sql = require('../../sql/rename/rename');
//Récup du créateur d'embed
const emb = require('../../modules/embeds');
//Fonction pour attendre
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    execute: async function(interaction, errEmb) {
        await sql.clearName();
        await sql.setName(interaction.components[0].components[0].value);
        interaction.guild.members.cache.get(interaction.client.user.id).setNickname(interaction.components[0].components[0].value);
        //Send confirmation message
                await interaction.reply({ embeds: [emb.generate(null, null, `Mon nom à bien été définis sur **${interaction.components[0].components[0].value}** !`, "#0DE600", process.env.LSMS_LOGO_V2, null, `Gestion ${interaction.client.user.username}`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).icon}.webp`, null, null, null, false)], ephemeral: true });
        // Supprime la réponse après 5s
        await wait(5000);
        await interaction.deleteReply();
    }
}