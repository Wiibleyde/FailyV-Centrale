//Récup du logger
const logger = require('./../modules/logger');
//Récup du créateur d'embed
const emb = require('./../modules/embeds');

const serviceID = process.env.IRIS_SERVICE_ROLE_ID;
const dispatchID = process.env.IRIS_DISPATCH_ROLE_ID;
const offID = process.env.IRIS_OFF_ROLE_ID;

module.exports = {
    execute: async function(interaction, errEmb) {
        //Logs de quel option du menu de selection à été utilisée
        logger.log(`${interaction.user.username}#${interaction.user.discriminator} (${interaction.user}) a utilisé(e) l'option "${interaction.values}" du menu de séléction "${interaction.customId}"`);
        
        //Confirmation à Discord du succès de l'opération
        await interaction.deferReply({ ephemeral: true });
        setTimeout(() => {
            interaction.message.delete();
        }, 1000);
        let respContent = '';
        for(i=0;i<interaction.values.length;i++) {
            const user = interaction.guild.members.cache.get(interaction.values[i]);
            if(i == 0) {
                respContent = respContent + `<@${interaction.values[i]}>`
            } else if(i != interaction.values.length - 1) {
                respContent = respContent + `, <@${interaction.values[i]}>`
            } else {
                respContent = respContent + ` et <@${interaction.values[i]}>`
            }
            setTimeout(async () => {
                let switchRole = interaction.guild.roles.cache.find(role => role.id === serviceID);
                if(user.roles.cache.has(serviceID)) {
                    if(user.roles.cache.has(dispatchID)) {
                        let dispatchRole = interaction.guild.roles.cache.find(role => role.id === dispatchID);
                        setTimeout(() => {
                            user.roles.remove(dispatchRole);
                        }, 2000);
                    }
                    if(user.roles.cache.has(offID)) {
                        let offRole = interaction.guild.roles.cache.find(role => role.id === offID);
                        setTimeout(() => {
                            user.roles.remove(offRole);
                        }, 4000);
                    }
                    user.roles.remove(switchRole);
                } else {
                    user.roles.add(switchRole);
                }
            }, 2000);
        }
        interaction.followUp({ embeds: [emb.generate(null, null, respContent + ` a/ont correctement été retiré(e)(s) du service !`, `#0DE600`, null, null, `Gestion du service`, `https://cdn.discordapp.com/attachments/1083724872045297734/1124914370217005127/LSMS.png`, null, null, null, true)], ephemeral: true });
    }
}