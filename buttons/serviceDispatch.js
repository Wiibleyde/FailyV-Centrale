//Récup du logger
const logger = require('./../modules/logger');
//Récup du créateur d'embed
const emb = require('./../modules/embeds');
//Récup du système de cooldown
const cooldown = require('./../modules/serviceCooldown');

const serviceID = process.env.IRIS_SERVICE_ROLE_ID;
const dispatchID = process.env.IRIS_DISPATCH_ROLE_ID;

module.exports = {
    execute: async function(interaction, errEmb) {
        try {
            if(interaction.member.roles.cache.has(serviceID)) {
                let switchRole = interaction.guild.roles.cache.find(role => role.id === dispatchID);
                if(interaction.member.roles.cache.has(dispatchID)) {
                    interaction.member.roles.remove(switchRole);
                } else {
                    interaction.member.roles.add(switchRole);
                }
                //Confirmation à Discord du succès de l'opération
                await interaction.deferUpdate();
            } else {
                await interaction.reply({ embeds: [emb.generate(`Action impossible !`, null, `Désolé, vous devez obligatoirement être en service pour prendre le dispatch !`, `#ff0000`, null, null, null, null, null, interaction.client.user.username, interaction.client.user.avatarURL(), true)], ephemeral: true });
            }
        } catch(err) {
            logger.error(err);
            await interaction.reply({ embeds: [errEmb], ephemeral: true });
        }
    }
}