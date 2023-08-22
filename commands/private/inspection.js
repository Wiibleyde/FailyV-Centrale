//Récupération des fonctions pour créer une commande
const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
//Récup du logger
const logger = require('../../modules/logger');
//Récup du créateur d'embed
const emb = require('../../modules/embeds');
//Récup du sql pour les inspections
const inspectionSQL = require('../../sql/inspection/inspection');
// Récup du sql pour les entreprises
const companySQL = require('../../sql/company/company');
//Fonction pour attendre
const wait = require('node:timers/promises').setTimeout;

let reply;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('inspection')
        .setDescription('Gestion des inspections')
        .addStringOption(option =>
            option.setName(`action`)
            .setDescription(`Action à effectuer`)
            .addChoices(
                {
                    name: `Voir les inspections`,
                    value: `voir`
                },
                {
                    name: `Ajouter ou mettre à jour une inspection`,
                    value: `update`
                }
            ).setRequired(true)
        ),
    async execute(interaction) {
        if(interaction.commandName == 'inspection') {
            switch(interaction.options.getString(`action`)) {
                case `voir`:
                    let inspections = await inspectionSQL.getInspections()
                    let fields = []
                    let embed = emb.generate(`Gestion des inspection`, null, `Liste des inspections`, `#0DE600`, process.env.LSMS_LOGO_V2, null, null, null, null, interaction.client.user.username, interaction.client.user.avatarURL(), true)
                    if(inspections.length <= 0) {
                        embed.addFields(
                            {
                                name: `Aucune inspection`,
                                value: `Aucune inspection n'a été trouvée`
                            }
                        )
                    }
                    inspections.forEach(async inspection => {
                        let date = inspection.date
                        if(!isToday(date)) {
                            let time = new Date(`${new Date(date)} GMT+2:00`);
                            let started_at = Math.floor(time / 1000);
                            date = `<t:${started_at}:R>`
                        } else {
                            date = "`Aujourd'hui`"
                        }
                        fields.push({
                            name: `${inspection.company}`,
                            value: `${date} par : ${inspection.doctors}`
                        })
                    })
                    embed.addFields(fields)
                    interaction.reply({embeds: [embed], ephemeral: true});
                    break;
                case `update`:
                    let companies = await companySQL.getAllcompanyBySide(1)
                    let options = new StringSelectMenuBuilder().setCustomId('inspectionCompanyUpdateSelect').setPlaceholder('Sélectionnez une entreprise').setMinValues(1).setMaxValues(1)
                    let totalOptions = 0
                    companies.forEach(company => {
                        options.addOptions(new StringSelectMenuOptionBuilder().setLabel(`${company.name}`).setValue(`${company.id}`))
                        totalOptions++
                    })
                    if (totalOptions != 0) {
                        const allOptions = new ActionRowBuilder().addComponents(options)
                        try {
                            interaction.reply({content: `Sélectionnez une entreprise`, components: [allOptions], ephemeral: true})
                        } catch (error) {
                            logger.error(error)
                            break;
                        }
                    } else {
                        interaction.reply({content: `Aucune entreprise n'a été trouvée`, ephemeral: true})
                    }
                    break;
                default:
                    break;
            }
        } else if(interaction.customId == 'inspectionCompanyUpdateSelect') {
            let inspection = await inspectionSQL.getInspectionById(interaction.values[0])
            const updateInspectionModal = new ModalBuilder().setCustomId('updateInspectionModal').setTitle(`Mise à jour d'une inspection`)
            const date = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('date').setLabel('Date de l\'inspection').setPlaceholder('JJ/MM/AAAA').setMinLength(1).setMaxLength(100).setStyle(TextInputStyle.Short))
            const doctors = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('doctors').setLabel('Médecins').setPlaceholder('Médecins').setMinLength(1).setMaxLength(100).setStyle(TextInputStyle.Short))
            const company = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('company').setLabel('Entreprise').setPlaceholder('Entreprise').setMinLength(1).setMaxLength(100).setStyle(TextInputStyle.Short).setValue(interaction.values[0]))
            updateInspectionModal.addComponents(date, doctors, company)
            await interaction.showModal(updateInspectionModal)
        }
    }
}

const isToday = (someDate) => {
    const today = new Date()
    return someDate.getDate() == today.getDate() &&
        someDate.getMonth() == today.getMonth() &&
        someDate.getFullYear() == today.getFullYear()
}
