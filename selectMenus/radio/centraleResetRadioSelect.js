//Récup du logger
const logger = require('../../modules/logger');
//Récup du créateur d'embed
const emb = require('../../modules/embeds');
//Fonction pour attendre
const wait = require('node:timers/promises').setTimeout;
//Fichier de service pour reset
const service = require('../../modules/service');

module.exports = {
    execute: async function(interaction, errEmb) {
        //Logs de quel option du menu de selection à été utilisée
        logger.log(`${interaction.member.nickname} - ${interaction.user.username}#${interaction.user.discriminator} (\\${interaction.user})\n\na utilisé(e) l'option "${interaction.values}" du menu de séléction "${interaction.customId}"`, interaction.client);
        
        //Confirmation à Discord du succès de l'opération
        await interaction.deferReply({ ephemeral: true });
        let radiosToReset = [];
        let respContent = 'La/les radio(s) ';
        for(i=0;i<interaction.values.length;i++) {
            if(i == 0) {
                respContent = respContent + `**${interaction.values[i]}**`
            } else if(i != interaction.values.length - 1) {
                respContent = respContent + `, **${interaction.values[i]}**`
            } else {
                respContent = respContent + ` et **${interaction.values[i]}**`
            }
            radiosToReset.push(interaction.values[i]);
        }
        if(radiosToReset.length == 1) {
            radiosToReset.push('none');
        }
        service.resetSpecificRadio(interaction.client, interaction, radiosToReset);
        interaction.followUp({ embeds: [emb.generate(null, null, respContent + ` a/ont correctement été réinitialisée(s) !`, `#0DE600`, process.env.LSMS_LOGO_V2, null, `Gestion des radios`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).icon}.webp`, null, null, null, true)], ephemeral: true });
        // Supprime la réponse après 5s
        await wait(5000);
        await interaction.deleteReply();
    }
}