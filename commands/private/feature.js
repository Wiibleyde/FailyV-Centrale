//Récupération des fonctions pour créer une commande
const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
//Récup du logger
const logger = require('../../modules/logger');
//Récup du créateur d'embed
const emb = require('../../modules/embeds');
//Fonction pour attendre
const wait = require('node:timers/promises').setTimeout;
//Récupération du module sql pour les features
const featureSQL = require('../../sql/patchnote/feature');

const typeEmojis = {
    0: `🔧`,
    1: `🔨`,
    2: `🆕`,
    3: `🗑️`
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('feature')
        .setDescription('[ADMIN] Gestion des features')
        .addStringOption(option =>
            option.setName('action')
                .setDescription('Action à effectuer')
                .addChoices(
                    {
                        name: 'Créer une feature',
                        value: 'create'
                    },
                    {
                        name: 'Supprimer une feature',
                        value: 'delete'
                    },
                    {
                        name: 'Lister les features (non envoyées)',
                        value: 'list'
                    },
                    {
                        name: 'Modifier une feature',
                        value: 'update'
                    }
                )
                .setRequired(true)
        ),
    async execute(interaction) {
        if(interaction.user.id == '461880599594926080' || interaction.user.id == '461807010086780930' || interaction.user.id == '368259650136571904') {
            switch(interaction.options.getString(`action`)) {
                case `create`:
                    const addFeatureModal = new ModalBuilder().setCustomId('addFeatureModal').setTitle('Ajouter une feature');
                    const type = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('type').setLabel('Type de changement').setStyle(TextInputStyle.Short).setPlaceholder('0 = Fix, 1 = Update, 2 = New, 3 = Delete').setRequired(true))
                    const title = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('title').setLabel('Titre de la feature').setStyle(TextInputStyle.Short).setPlaceholder('Titre de la feature').setRequired(true))
                    const feature = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('feature').setLabel('Description de la feature').setStyle(TextInputStyle.Short).setPlaceholder('Description de la feature').setRequired(true))
                    addFeatureModal.addComponents(type, title, feature)
                    await interaction.showModal(addFeatureModal)
                    break;
                case `delete`:
                    let featuresToDelete = await featureSQL.getFeaturesNotSent()
                    let options = new StringSelectMenuBuilder().setCustomId('featureDeleteSelect').setPlaceholder('Choisissez les features à supprimer').setMinValues(1)
                    let totalFeatures = 0
                    featuresToDelete.forEach(feature => {
                        options.addOptions(new StringSelectMenuOptionBuilder().setLabel(`${typeEmojis[feature.type]} : ${feature.name}`).setValue(`${feature.id}`))
                        totalFeatures++
                    })
                    options.setMaxValues(totalFeatures)
                    if(totalFeatures != 0) {
                        const allOptions = new ActionRowBuilder().addComponents(options);
                        try {
                            await interaction.reply({ components: [allOptions], ephemeral: true })
                        } catch (err) {
                            logger.error(err)
                            //Confirmation à Discord du succès de l'opération
                            await interaction.reply({ embeds: [errEmb], ephemeral: true });
                        }
                    } else {
                        let embed = emb.generate(`Gestion des features`, null, `Liste des features`, `#0DE600`, process.env.LSMS_LOGO_V2, null, null, null, null, interaction.client.user.username, interaction.client.user.avatarURL(), true)
                        embed.addFields(
                            {
                                name: `Aucune feature`,
                                value: `Aucune feature n'a été trouvée`
                            }
                        )
                        await interaction.reply({ embeds: [embed], ephemeral: true })
                        // Supprime la réponse après 5s
                        await wait(5000);
                        await interaction.deleteReply();
                    }
                    break;
                case `list`:
                    let features = await featureSQL.getFeaturesNotSent()
                    let embed = emb.generate(`Gestion des features`, null, `Supprimer des features`, `#0DE600`, process.env.LSMS_LOGO_V2, null, null, null, null, interaction.client.user.username, interaction.client.user.avatarURL(), true)
                    if(features.length <= 0) {
                        embed.addFields(
                            {
                                name: `Aucune feature`,
                                value: `Aucune feature n'a été trouvée`
                            }
                        )
                    }
                    features.forEach(feature => {
                        embed.addFields({
                            name: `${typeEmojis[feature.type]} : **${feature.name}**`,
                            value: `${feature.feature}`
                        })
                    })
                    await interaction.reply({ embeds: [embed], ephemeral: true })
                    break;
                case `update`:
                    let featuresToUpdate = await featureSQL.getFeaturesNotSent()
                    let optionsUpdate = new StringSelectMenuBuilder().setCustomId('featureUpdateSelect').setPlaceholder('Choisissez la feature à modifier').setMinValues(1).setMaxValues(1)
                    let totalFeaturesUpdate = 0
                    featuresToUpdate.forEach(feature => {
                        optionsUpdate.addOptions(new StringSelectMenuOptionBuilder().setLabel(`${typeEmojis[feature.type]} : ${feature.name}`).setValue(`${feature.id}`))
                        totalFeaturesUpdate++
                    })
                    if(totalFeaturesUpdate != 0) {
                        const allOptionsUpdate = new ActionRowBuilder().addComponents(optionsUpdate);
                        try {
                            await interaction.reply({ components: [allOptionsUpdate], ephemeral: true })
                        } catch (err) {
                            logger.error(err)
                            //Confirmation à Discord du succès de l'opération
                            await interaction.reply({ embeds: [errEmb], ephemeral: true });
                        }
                    } else {
                        let embed = emb.generate(`Gestion des features`, null, `Modifier une feature`, `#0DE600`, process.env.LSMS_LOGO_V2, null, null, null, null, interaction.client.user.username, interaction.client.user.avatarURL(), true)
                        embed.addFields(
                            {
                                name: `Aucune feature`,
                                value: `Aucune feature n'a été trouvée`
                            }
                        )
                        await interaction.reply({ embeds: [embed], ephemeral: true })
                        // Supprime la réponse après 5s
                        await wait(5000);
                        await interaction.deleteReply();
                    }
                    break;
                default:
                    await interaction.reply({content: `Cette action n'existe pas`, ephemeral: true})
                    // Supprime la réponse après 5s
                    await wait(5000);
                    await interaction.deleteReply();
                    break;
            }
        } else {
            interaction.reply({ embeds: [emb.generate(null, null, `Désolé :(\n\nCette commande est réservé à mes développeurs (<@461880599594926080>, <@461807010086780930> et <@368259650136571904>) au cas où j'aurais un soucis !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, `DEBUG MODE`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, true)], ephemeral: true });
        }
    }
}
