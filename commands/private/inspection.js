//Récupération des fonctions pour créer une commande
const { SlashCommandBuilder } = require('discord.js');
//Récup du logger
const logger = require('../../modules/logger');
//Récup du créateur d'embed
const emb = require('../../modules/embeds');
//Récup du sql pour les inspections
const inspectionSQL = require('../../sql/inspection/inspection');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('inspection')
        .setDescription('Gestion des inspections')
        .addStringOption(option =>
            option.setName(`action`)
            .setDescription(`Action à effectuer`)
            .addChoices(
                {
                    name: `Voir`,
                    value: `voir`
                },
                {
                    name: `Mettre à jour l'inspection d'une entrprise`,
                    value: `update`
                },
                {
                    name: `Ajouter`,
                    value: `add`
                }
            ).setRequired(true)
        ),
    async execute(interaction) {
        switch(interaction.option.getString(`action`)) {
            case `voir`:
                //Récupération des inspection
                const inspections = inspectionSQL.getInspections()
                let fields = []
                //Pour chaque inspection
                inspections.forEach(async inspection => {
                    //Ajout du champ
                    fields.push({
                        name: `ID: ${inspection.id}`,
                        value: `${inspection.company} : ${inspection.date}\nPar ${inspection.doctor}`
                    })
                })
                const embed = emb.generate(`Gestion des inspection`, null, `Liste des inspections`, `#0DE600`, process.env.LSMS_LOGO_V2, null, null, null, null, interaction.client.user.username, interaction.client.user.avatarURL(), true)
                embed.addFields(fields)
                interaction.reply({embeds: [embed], ephemeral: true});
                break;
            case `update`:
                break;
            case `add`:
                break;
            default:
                interaction.reply({content: `Action inconnue`, ephemeral: true})
        }
    }
}
