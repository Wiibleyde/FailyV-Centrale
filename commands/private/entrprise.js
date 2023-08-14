//Récupération des fonctions pour créer une commande
const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
//Récup du logger
const logger = require('../../modules/logger');
//Récup du créateur d'embed
const emb = require('../../modules/embeds');
//Fonction pour attendre
const wait = require('node:timers/promises').setTimeout;
//Récup du module de gestion des entreprises
const company = require('../../sql/company/company');

const side = {
    true: 'Sud',
    false: 'Nord'
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('entreprise')
        .setDescription('Gestion des entreprises')
        .addStringOption(option =>
            option.setName('action')
                .setDescription('Action à effectuer')
                .addChoices(
                    {
                        name: 'Voir les entreprises',
                        value: 'voir'
                    },
                    {
                        name: 'Ajouter une entreprise',
                        value: 'add'
                    },
                    {
                        name: 'Modifier une entreprise',
                        value: 'update'
                    },
                    {
                        name: 'Supprimer une entreprise',
                        value: 'delete'
                    }
                ).setRequired(true)
        ),
    async execute(interaction) {
        if (interaction.commandName == 'entreprise') {
            const companies = await company.getAllcompany()
            switch (interaction.options.getString('action')) {
                case 'voir':
                    let fields = []
                    let embed = emb.generate('Gestion des entreprises', null, 'Liste des entreprises', '#0DE600', process.env.LSMS_LOGO_V2, null, null, null, null, interaction.client.user.username, interaction.client.user.avatarURL(), true)
                    if (companies.length <= 0) {
                        embed.addFields(
                            {
                                name: 'Aucune entreprise',
                                value: 'Aucune entreprise n\'a été trouvée'
                            }
                        )
                    }
                    for(let i = 0; i < companies.length; i++) {
                        let companySide = companies[i].side == 1 ? 'Sud' : 'Nord'
                        fields.push(
                            {
                                name: `${companies[i].acronym}`,
                                value: `Nom: ${companies[i].name}\nJuridiction: ${companySide}`
                            }
                        )
                    }
                    embed.addFields(fields)
                    interaction.reply({ embeds: [embed], ephemeral: true })
                    break;
                case 'add':
                    const addCompanyModal = new ModalBuilder().setCustomId('addCompanyModal').setTitle('Ajouter une entreprise')
                    const name = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('name').setLabel('Nom de l\'entreprise').setPlaceholder('Ex : Los Santos Medical Service').setStyle(TextInputStyle.Short).setRequired(true))
                    const acronym = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('acronym').setLabel('Acronyme de l\'entreprise').setPlaceholder('Ex : LSMS').setStyle(TextInputStyle.Short).setRequired(true))
                    const side = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('side').setLabel('Côté de l\'entreprise').setPlaceholder('Ex : Nord / Sud').setStyle(TextInputStyle.Short).setRequired(true))
                    addCompanyModal.addComponents(name, acronym, side)
                    await interaction.showModal(addCompanyModal)
                    break;
                case 'update':
                    // Select menu pour choisir l'entreprise à modifier
                    let options = new StringSelectMenuBuilder().setCustomId('companyGlobalUpdateSelect').setPlaceholder('Choisissez une entreprise').setMaxValues(1).setMinValues(1)
                    let totalOptions = 0
                    companies.forEach(company => {
                        options.addOptions(new StringSelectMenuOptionBuilder().setLabel(`${company.name} (${company.acronym})`).setValue(`${company.id}`))
                        totalOptions++
                    })
                    if(totalOptions != 0) {
                        const allOptions = new ActionRowBuilder().addComponents(options)
                        try {
                            reply = await interaction.reply({ components: [allOptions], ephemeral: true })
                        } catch (error) {
                            logger.error(error)
                            break;
                        }
                    } else {
                        let embed = emb.generate('Gestion des entreprises', null, 'Liste des entreprises', '#0DE600', process.env.LSMS_LOGO_V2, null, null, null, null, interaction.client.user.username, interaction.client.user.avatarURL(), true)
                        embed.addFields(
                            {
                                name: 'Aucune entreprise',
                                value: 'Aucune entreprise n\'a été trouvée'
                            }
                        )
                        interaction.reply({ embeds: [embed], ephemeral: true })
                        // Suppression du message après 5 secondes
                        await wait(5000)
                        await interaction.deleteReply()
                    }
                    break;
                case 'delete':
                    // Select menu pour choisir l'entreprise à supprimer
                    let optionsDelete = new StringSelectMenuBuilder().setCustomId('companyGlobalDeleteSelect').setPlaceholder('Choisissez une entreprise').setMaxValues(1).setMinValues(1)
                    let totalOptionsDelete = 0
                    companies.forEach(company => {
                        optionsDelete.addOptions(new StringSelectMenuOptionBuilder().setLabel(`${company.name} (${company.acronym})`).setValue(`${company.id}`))
                        totalOptionsDelete++
                    })
                    if(totalOptionsDelete != 0) {
                        const allOptions = new ActionRowBuilder().addComponents(optionsDelete)
                        try {
                            reply = await interaction.reply({ components: [allOptions], ephemeral: true })
                        } catch (error) {
                            logger.error(error)
                            break;
                        }
                    } else {
                        let embed = emb.generate('Gestion des entreprises', null, 'Liste des entreprises', '#0DE600', process.env.LSMS_LOGO_V2, null, null, null, null, interaction.client.user.username, interaction.client.user.avatarURL(), true)
                        embed.addFields(
                            {
                                name: 'Aucune entreprise',
                                value: 'Aucune entreprise n\'a été trouvée'
                            }
                        )
                        interaction.reply({ embeds: [embed], ephemeral: true })
                        // Suppression du message après 5 secondes
                        await wait(5000)
                        await interaction.deleteReply()
                    }
                    break;
            }
        } else if(interaction.customId == 'companyGlobalUpdateSelect') {
            try {
                await reply.edit({ embeds: [emb.generate(null, null, `<a:loading:1137771560531398697> Mise à jour en cours...`, `Gold`, process.env.LSMS_LOGO_V2, null, `Gestion des features`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], components: [], ephemeral: true });
            } catch (err) {
                await interaction.deferReply({ ephemeral: true });
            }
            const companyToUpdate = await company.getCompany(interaction.values[0])
            let companySide = ''
            if(companyToUpdate[0].side) {
                companySide = "Sud"
            } else {
                companySide = "Nord"
            }
            const updateCompanyModal = new ModalBuilder().setCustomId('updateCompanyModal').setTitle('Modifier une entreprise')
            const name = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('name').setLabel('Nom de l\'entreprise').setPlaceholder('Ex : Los Santos Medical Service').setStyle(TextInputStyle.Short).setRequired(true).setValue(`${companyToUpdate[0].name}`))
            const acronym = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('acronym').setLabel('Acronyme de l\'entreprise').setPlaceholder('Ex : LSMS').setStyle(TextInputStyle.Short).setRequired(true).setValue(`${companyToUpdate[0].acronym}`))
            const side = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('side').setLabel('Côté de l\'entreprise').setPlaceholder('Ex : Nord / Sud').setStyle(TextInputStyle.Short).setRequired(true).setValue(`${companySide}`))
            const id = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('id').setLabel('NE PAS TOUCHER !').setPlaceholder('Ex : 1').setStyle(TextInputStyle.Short).setRequired(true).setValue(`${companyToUpdate[0].id}`))
            updateCompanyModal.addComponents(name, acronym, side, id)
            await interaction.showModal(updateCompanyModal)
        } else if(interaction.customId == 'companyGlobalDeleteSelect') {
            try {
                await reply.edit({ embeds: [emb.generate(null, null, `<a:loading:1137771560531398697> Suppression en cours...`, `Gold`, process.env.LSMS_LOGO_V2, null, `Gestion des features`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], components: [], ephemeral: true });
            } catch (err) {
                await interaction.deferReply({ ephemeral: true });
            }
            const companyToDelete = await company.getCompany(interaction.values[0])
            await company.deleteCompany(interaction.values[0])
            let embed = emb.generate('Gestion des entreprises', null, 'Suppression d\'une entreprise', '#0DE600', process.env.LSMS_LOGO_V2, null, null, null, null, interaction.client.user.username, interaction.client.user.avatarURL(), true)
            embed.addFields(
                {
                    name: 'Entreprise supprimée',
                    value: `L'entreprise **${companyToDelete.name}** a été supprimée avec succès`
                }
            )
            await interaction.reply({ embeds: [embed], ephemeral: true })
            // Suppression du message après 5 secondes
            await wait(5000)
            await interaction.deleteReply()
        }
    }
}

