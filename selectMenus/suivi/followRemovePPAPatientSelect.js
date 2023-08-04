//Récup du logger
const logger = require('../../modules/logger');
//Récup du créateur d'embed
const emb = require('../../modules/embeds');
//Fonction pour attendre
const wait = require('node:timers/promises').setTimeout;
//Récup des requêtes SQL
const sqlFollow = require('../../sql/suivi/suivi');
const sqlFollowPPA = require('../../sql/suivi/ppa');
//Récup du régénérateur de véhicules
const suivi = require('../../modules/suiviMessages');

const format = require('../../modules/formatName');

const security = require('../../modules/service');

module.exports = {
    execute: async function (interaction, errEmb) {
        await interaction.deferReply({ ephemeral: true });
        //Logs de quel option du menu de selection à été utilisée
        logger.log(`${interaction.member.nickname} - ${interaction.user.username}#${interaction.user.discriminator} (${interaction.user})\n\na utilisé(e) l'option "${interaction.values}" du menu de séléction "${interaction.customId}"`);
        let respContent = 'Le(s) patient(s) ';
        let isPatientNull = false;
        for(i=0;i<interaction.values.length;i++) {
            const patient = await sqlFollowPPA.getById(interaction.values[i]);
            if(patient[0] != null) {
                let name = format.name(patient[0].name);
                await sqlFollowPPA.delete(interaction.values[i]);
                if(i == 0) {
                    respContent = respContent + `**${name}**`
                } else if(i != interaction.values.length - 1) {
                    respContent = respContent + `, **${name}**`
                } else {
                    respContent = respContent + ` et **${name}**`
                }
            } else {
                isPatientNull = true;
            }
        }
        //Send confirmation message
        if(!isPatientNull) {
            //Récupération du channel des véhicules
            const followChannel = await sqlFollow.getFollowChannelId();
            if(followChannel[0] == null) {
                return interaction.followUp({ embeds: [emb.generate(null, null, `⚠️ Attention, aucun salon de suivi n'a été trouvé en base de donnée\nVeuillez contacter un des développeurs (<@461880599594926080>, <@461807010086780930> ou <@368259650136571904>) pour régler ce problème !`, 'Gold', process.env.LSMS_LOGO_V2, null, `Gestion des PPA`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });
            }
            security.setGen(true);
            await suivi.regen(interaction.client);
            security.setGen(false);
            await interaction.followUp({ embeds: [emb.generate(null, null, `${respContent} a/ont bien été retiré(s) de la liste d'attente !`, `#0DE600`, process.env.LSMS_LOGO_V2, null, `Gestion des PPA`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });
            // Supprime la réponse après 5s
            await wait(5000);
            await interaction.deleteReply();
        } else {
            await interaction.followUp({ embeds: [emb.generate(null, null, `⚠️ Attention, il n'y a plus aucun patient encore présent dans cette liste à supprimer\nSi jamais il en reste encore veuillez réutiliser le bouton !`, `Gold`, process.env.LSMS_LOGO_V2, null, `Gestion des PPA`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });
        }
    }
}