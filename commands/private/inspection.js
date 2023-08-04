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
                    name: `Ajouter ou mettre à jour l'inspection d'une entrprise`,
                    value: `update`
                }
            ).setRequired(true)
        ),
    async execute(interaction) {
        switch(interaction.options.getString(`action`)) {
            case `voir`:
                let inspections = await inspectionSQL.getInspections()
                let fields = []
                const embed = emb.generate(`Gestion des inspection`, null, `Liste des inspections`, `#0DE600`, process.env.LSMS_LOGO_V2, null, null, null, null, interaction.client.user.username, interaction.client.user.avatarURL(), true)
                if(inspections.length <= 0) {
                    embed.addFields(
                        {
                            name: `Aucune inspection`,
                            value: `Aucune inspection n'a été trouvée`
                        }
                    )
                }
                inspections.forEach(async inspection => {
                    fields.push({
                        value: `${inspection.company} : ${inspection.date}\nPar ${inspection.doctors}`
                    })
                })
                embed.addFields(fields)
                interaction.reply({embeds: [embed], ephemeral: true});
                break;
            case `update`:
                break;
            default:
                interaction.reply({content: `Action inconnue`, ephemeral: true})
        }
    }
}
