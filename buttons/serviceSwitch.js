//Récup du logger
const logger = require('./../modules/logger');
//Récup du créateur d'embed
const emb = require('./../modules/embeds');
//Récup du système de cooldown
const cooldown = require('./../modules/serviceCooldown');

const serviceID = process.env.IRIS_SERVICE_ROLE_ID;
const dispatchID = process.env.IRIS_DISPATCH_ROLE_ID;
const offID = process.env.IRIS_OFF_ROLE_ID;

module.exports = {
    execute: async function(interaction, errEmb) {
        if(cooldown.get() == 0) {
            cooldown.start();
            try {
                let switchRole = interaction.guild.roles.cache.find(role => role.id === serviceID);
                if(interaction.member.roles.cache.has(serviceID)) {
                    if(interaction.member.roles.cache.has(dispatchID)) {
                        let dispatchRole = interaction.guild.roles.cache.find(role => role.id === dispatchID);
                        setTimeout(() => {
                            interaction.member.roles.remove(dispatchRole);
                        }, 2000);
                    }
                    if(interaction.member.roles.cache.has(offID)) {
                        let offRole = interaction.guild.roles.cache.find(role => role.id === offID);
                        setTimeout(() => {
                            interaction.member.roles.remove(offRole);
                        }, 4000);
                    }
                    interaction.member.roles.remove(switchRole);
                } else {
                    interaction.member.roles.add(switchRole);
                }
                //Confirmation à Discord du succès de l'opération
                await interaction.deferUpdate();
            } catch(err) {
                logger.error(err);
                await interaction.reply({ embeds: [errEmb], ephemeral: true });
            }
        } else {
            await interaction.reply({ embeds: [emb.generate(`Action impossible !`, null, `Désolé, une cooldown est actuellement en cours sur la gestion du service !\nVeuillez patienter encore ${cooldown.get()}s`, `#ff0000`, null, null, null, null, null, interaction.client.user.username, interaction.client.user.avatarURL(), true)], ephemeral: true });
        }
    }
}