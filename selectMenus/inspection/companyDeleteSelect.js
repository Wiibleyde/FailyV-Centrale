//Récup du logger
const logger = require('../../modules/logger');
//Récup du créateur d'embed
const emb = require('../../modules/embeds');
//Fonction pour attendre
const wait = require('node:timers/promises').setTimeout;
//Récup du module sql pour les inspections
const inspectionSQL = require('../../sql/inspection/inspection');

module.exports = {
    execute: async function(interaction, errEmb) {
        //Logs de quel option du menu de selection à été utilisée
        logger.log(`${interaction.member.nickname} - ${interaction.user.username}#${interaction.user.discriminator} (${interaction.user})\n\na utilisé(e) l'option "${interaction.values}" du menu de séléction "${interaction.customId}"`);
        //Confirmation à Discord du succès de l'opération
        let companies = ""
        await interaction.deferReply({ ephemeral: true });
        for (i=0;i<interaction.values.length;i++) {
            const company = interaction.values[i]
            await inspectionSQL.deleteCompany(company);
            if(i < interaction.values.length) {
                companies = companies + company + ", "
            } else {
                companies = companies + company
            }
        }
        interaction.followUp({ embeds: [emb.generate(null, null, `Les entreprises ${companies} ont bien été supprimées de la liste des entreprises à inspecter !`, `#0DE600`, process.env.LSMS_LOGO_V2, null, `Gestion des inspections`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, true)], ephemeral: true });
    }
}