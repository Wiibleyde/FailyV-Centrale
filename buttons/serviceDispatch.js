//Récup du logger
const logger = require('../modules/logger');
//Récup du créateur d'embed
const emb = require('../modules/embeds');
//Récup du systeme de logs RP
const logRP = require('../modules/logsRP');
//Fonction pour attendre
const wait = require('node:timers/promises').setTimeout;

const serviceID = process.env.IRIS_SERVICE_ROLE_ID;
const dispatchID = process.env.IRIS_DISPATCH_ROLE_ID;

module.exports = {
    execute: async function(interaction, errEmb) {
        try {
            if(interaction.member.roles.cache.has(serviceID)) {
                let embed;
                let switchRole = interaction.guild.roles.cache.find(role => role.id === dispatchID);
                if(interaction.member.roles.cache.has(dispatchID)) {
                    interaction.member.roles.remove(switchRole);
                    embed = emb.generate(`Dispatch relâché`, null, `Vous avez relâché votre rôle de dispatcheur\n*À bientôt !*`, `#FFF1D0`, process.env.LSMS_LOGO_V2, null, `Gestion du service`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).icon}.webp`, null, null, null, false);
                    logRP.fdd(interaction.guild, interaction.guild.members.cache.get(interaction.user.id).nickname, null);
                } else {
                    interaction.member.roles.add(switchRole);
                    embed = emb.generate(`Prise de dispatch`, null, `Vous êtes maintenant un dispatcheur\n*Bon courage pour votre gestion !*`, `#FFF1D0`, process.env.LSMS_LOGO_V2, null, `Gestion du service`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).icon}.webp`, null, null, null, false);
                    logRP.pdd(interaction.guild, interaction.guild.members.cache.get(interaction.user.id).nickname, null);
                }
                //Confirmation à l'utilisateur du succès de l'opération
                await interaction.reply({ embeds: [embed], ephemeral: true });
                // Supprime la réponse après 5s
                await wait(5000);
                await interaction.deleteReply();
            } else {
                await interaction.reply({ embeds: [emb.generate(`Action impossible !`, null, `Désolé, vous devez obligatoirement être en service pour prendre le dispatch !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, null, null, null, interaction.client.user.username, interaction.client.user.avatarURL(), true)], ephemeral: true });
                // Supprime la réponse après 5s
                await wait(5000);
                await interaction.deleteReply();
            }
        } catch(err) {
            logger.error(err);
            await interaction.reply({ embeds: [errEmb], ephemeral: true });
        }
    }
}