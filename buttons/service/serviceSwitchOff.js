//Récup du logger
const logger = require('../../modules/logger');
//Récup du créateur d'embed
const emb = require('../../modules/embeds');
//Fonction pour attendre
const wait = require('node:timers/promises').setTimeout;

const serviceID = process.env.IRIS_SERVICE_ROLE_ID;
const offID = process.env.IRIS_OFF_ROLE_ID;

module.exports = {
    execute: async function(interaction, errEmb) {
        try {
            if(interaction.member.roles.cache.has(serviceID)) {
                let embed;
                let switchRole = interaction.guild.roles.cache.find(role => role.id === offID);
                if(interaction.member.roles.cache.has(offID)) {
                    interaction.member.roles.remove(switchRole);
                    embed = emb.generate(`Fin de off radio`, null, `Vous n'êtes plus en off radio\n*C'est reparti à fond les bananes !*`, `#000000`, process.env.LSMS_LOGO_V2, null, `Gestion du service`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).icon}.webp`, null, null, null, false);
                } else {
                    interaction.member.roles.add(switchRole);
                    embed = emb.generate(`Début de off radio`, null, `Vous êtes désormais en off radio`, `#000000`, process.env.LSMS_LOGO_V2, null, `Gestion du service`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).icon}.webp`, null, null, null, false)
                }
                //Confirmation à l'utilisateur du succès de l'opération
                await interaction.reply({ embeds: [embed], ephemeral: true });
                // Supprime la réponse après 5s
                await wait(5000);
                await interaction.deleteReply();
            } else {
                await interaction.reply({ embeds: [emb.generate(`Action impossible !`, null, `Désolé, vous devez obligatoirement être en service pour prendre un off radio !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, null, null, null, interaction.client.user.username, interaction.client.user.avatarURL(), true)], ephemeral: true });
                // Supprime la réponse après 5s
                await wait(5000);
                await interaction.deleteReply();
            }
        } catch(err) {
            logger.ogger.error(err);
            await interaction.reply({ embeds: [errEmb], ephemeral: true });
        }
    }
}