//Récup du logger
const logger = require('../../modules/logger');
//Récup du créateur d'embed
const emb = require('../../modules/embeds');
//Récup du systeme de logs RP
const logRP = require('../../modules/logsRP');
//Fonction pour attendre
const wait = require('node:timers/promises').setTimeout;

const serviceID = process.env.IRIS_SERVICE_ROLE_ID;
const dispatchID = process.env.IRIS_DISPATCH_ROLE_ID;
const offID = process.env.IRIS_OFF_ROLE_ID;

module.exports = {
    execute: async function(interaction, errEmb) {
        //Logs de quel option du menu de selection à été utilisée
        logger.log(`${interaction.member.nickname} - ${interaction.user.username}#${interaction.user.discriminator} (${interaction.user})\n\na utilisé(e) l'option "${interaction.values}" du menu de séléction "${interaction.customId}"`);
        
        //Confirmation à Discord du succès de l'opération
        await interaction.deferReply({ ephemeral: true });
        /*setTimeout(() => {
            interaction.message.delete();
        }, 1000);*/
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
            let switchRole = interaction.guild.roles.cache.find(role => role.id === serviceID);
            if(user.roles.cache.has(serviceID)) {
                if(user.roles.cache.has(dispatchID)) {
                    let dispatchRole = interaction.guild.roles.cache.find(role => role.id === dispatchID);
                    user.roles.remove(dispatchRole);
                    logRP.fdd(interaction.guild, user.nickname, interaction.member.nickname);
                }
                if(user.roles.cache.has(offID)) {
                    let offRole = interaction.guild.roles.cache.find(role => role.id === offID);
                    user.roles.remove(offRole);
                }
                user.roles.remove(switchRole);
                logRP.fds(interaction.guild, user.nickname, interaction.member.nickname);
                try {
                    await user.send({ embeds: [emb.generate(`Bonjour, ${user.nickname}`, null, `Vous n'avez pas pris votre fin de service.\nMerci de penser à la prendre à l'avenir !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, `Gestion du service`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, `Cordialement, ${interaction.member.nickname}`, null, true)] });
                } catch(err) {
                }
            }
        }
        interaction.followUp({ embeds: [emb.generate(null, null, respContent + ` a/ont correctement été retiré(e)(s) du service !`, `#0DE600`, process.env.LSMS_LOGO_V2, null, `Gestion du service`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, true)], ephemeral: true });
        // Supprime la réponse après 5s
        await wait(5000);
        await interaction.deleteReply();
    }
}