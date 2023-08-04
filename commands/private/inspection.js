//Récupération des fonctions pour créer une commande
const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
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
                    name: `Ajouter ou mettre à jour une inspection`,
                    value: `update`
                },
                {
                    name: `Supprimer une inspection`,
                    value: `delete`
                }

            ).setRequired(true)
        ),
    async execute(interaction) {
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
                const updateInspeModal = new ModalBuilder().setCustomId('updateInspeModal').setTitle('Modification ou ajout d\'une inspection.');
                const company = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('company').setLabel('Nom de l\'entrprise').setStyle(TextInputStyle.Short).setPlaceholder('Ex: LSMS').setRequired(true));
                const doctors = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('doctors').setLabel('Nom des docteurs participants à l\'inspection').setStyle(TextInputStyle.Short).setPlaceholder('Ex: Dr. Prale | Ex: Dr. Prale, Dr. Wolf').setRequired(true));
                const date = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('date').setLabel('Date de l\'inspection').setStyle(TextInputStyle.Short).setPlaceholder('Ex: 09/11/2023').setRequired(false));
                updateInspeModal.addComponents(company, doctors, date);
                await interaction.showModal(updateInspeModal)
                break;
            case `delete`:
                let inspectionsDelete = await inspectionSQL.getInspections()
                let options = new StringSelectMenuBuilder().setCustomId('companyDeleteSelect').setPlaceholder('Choisissez les entrprises à retirer des inspections').setMinValues(1);
                let totalCompany = 0
                inspectionsDelete.map(d => {
                    options.addOptions(new StringSelectMenuOptionBuilder().setLabel(`${d.company}`).setValue(d.company))
                    totalCompany++
                })
                options.setMaxValues(totalCompany)
                if(totalCompany != 0) {
                    const allOptions = new ActionRowBuilder().addComponents(options);
                    try {
                        //Confirmation à Discord du succès de l'opération
                        await interaction.reply({ components: [allOptions], ephemeral: true });
                    } catch (err) {
                        logger.error(err)
                        //Confirmation à Discord du succès de l'opération
                        await interaction.reply({ embeds: [errEmb], ephemeral: true });
                    }
                } else {
                    await interaction.reply({content: `Aucune entreprise n'a été trouvée`, ephemeral: true})
                    // Supprime la réponse après 5s
                    await wait(5000);
                    await interaction.deleteReply();
                }
            default:
                break;
        }
    }
}

const isToday = (someDate) => {
    const today = new Date()
    return someDate.getDate() == today.getDate() &&
        someDate.getMonth() == today.getMonth() &&
        someDate.getFullYear() == today.getFullYear()
}
