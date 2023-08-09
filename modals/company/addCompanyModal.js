//Récup du logger
const logger = require('../../modules/logger');
//Récup du créateur d'embed
const emb = require('../../modules/embeds');
//Fonction pour attendre
const wait = require('node:timers/promises').setTimeout;
//Récup du sql pour les entreprises
const companySQL = require('../../sql/company/company');

module.exports = {
    execute: async function (interaction, errEmb) {
        const name = interaction.components[0].components[0].value
        const acronym = interaction.components[1].components[0].value
        let side = interaction.components[2].components[0].value
        if(side == `nord` || side == `Nord` || side == `NORD`) {
            side = false
        } else if(side == `sud` || side == `Sud` || side == `SUD`) {
            side = true
        }
        const testIfExist = await companySQL.testIfExist(name, acronym)
        if(testIfExist == true) {
            let embed = emb.generate('Gestion des entreprises', null, 'Liste des entreprises', '#0DE600', process.env.LSMS_LOGO_V2, null, null, null, null, interaction.client.user.username, interaction.client.user.avatarURL(), true)
            embed.addFields(
                {
                    name: `Entreprise déjà existante`,
                    value: `L'entreprise ${name} existe déjà`
                }
            )
            await interaction.reply({embeds: [embed], ephemeral: true})
            await wait(5000)
            await interaction.deleteReply()
            return
        }
        await companySQL.addCompany(name, acronym, side)
        let embed = emb.generate('Gestion des entreprises', null, 'Liste des entreprises', '#0DE600', process.env.LSMS_LOGO_V2, null, null, null, null, interaction.client.user.username, interaction.client.user.avatarURL(), true)
        embed.addFields(
            {
                name: `Entreprise ajoutée`,
                value: `L'entreprise ${name} a été ajoutée avec succès`
            }
        )
        await interaction.reply({embeds: [embed], ephemeral: true})
        await wait(5000)
        await interaction.deleteReply()
    }
}