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

let reply;

const typeEmojis = {
    0: `🔧`,
    1: `<:maj:1141039934153687130>`,
    2: `🆕`,
    3: `🗑️`
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('feature')
        .setDescription('[DEV ONLY] Gestion des features')
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
        const serverIcon = `https://cdn.discordapp.com/icons/${interaction.guild.id}/${interaction.guild.icon}.webp`;
        const authorTitleEmbed = `Gestion des features`;
        if(interaction.commandName == 'feature') {
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
                        reply = null;
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
                                reply = await interaction.reply({ components: [allOptions], ephemeral: true })
                            } catch (err) {
                                logger.error(err)
                                //Confirmation à Discord du succès de l'opération
                                await interaction.reply({ embeds: [errEmb], ephemeral: true });
                            }
                        } else {
                            let embed = emb.generate(null, null, `Liste des features`, `#0DE600`, process.env.LSMS_LOGO_V2, null, authorTitleEmbed, serverIcon, null, interaction.client.user.username, interaction.client.user.avatarURL(), true)
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
                        let embed = emb.generate(null, null, `Supprimer des features`, `#0DE600`, process.env.LSMS_LOGO_V2, null, authorTitleEmbed, serverIcon, null, interaction.client.user.username, interaction.client.user.avatarURL(), true)
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
                        reply = null;
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
                                reply = await interaction.reply({ components: [allOptionsUpdate], ephemeral: true })
                            } catch (err) {
                                logger.error(err)
                                //Confirmation à Discord du succès de l'opération
                                await interaction.reply({ embeds: [errEmb], ephemeral: true });
                            }
                        } else {
                            let embed = emb.generate(null, null, `Modifier une feature`, `#0DE600`, process.env.LSMS_LOGO_V2, null, authorTitleEmbed, serverIcon, null, interaction.client.user.username, interaction.client.user.avatarURL(), true)
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
                await interaction.reply({ embeds: [emb.generate(`Désolé :(`, null, `Cette commande est réservé à mes développeurs (<@461880599594926080>, <@461807010086780930> et <@368259650136571904>) !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, authorTitleEmbed, serverIcon, null, null, null, true)], ephemeral: true });
                await wait(5000);
                await interaction.deleteReply();
            }
        } else if(interaction.customId == 'featureDeleteSelect') {
            try {
                await reply.edit({ embeds: [emb.generate(null, null, `<a:loading:1140500830672392283> Mise à jour en cours...`, `Gold`, process.env.LSMS_LOGO_V2, null, authorTitleEmbed, serverIcon, null, null, null, false)], components: [], ephemeral: true });
            } catch (err) {
                await interaction.deferReply({ ephemeral: true });
            }
    
            let features = ""
            for (i=0;i<interaction.values.length;i++) {
                const feature = interaction.values[i]
                await featureSQL.deleteFeature(feature)
                if(i < interaction.values.length) {
                    features = features + feature + ", "
                } else {
                    features = features + feature
                }
            }
            try {
                if(interaction.values.length > 1) {
                    await reply.edit({ embeds: [emb.generate(null, null, `Les features ${features} ont bien été supprimées de la liste des features !`, `#0DE600`, process.env.LSMS_LOGO_V2, null, authorTitleEmbed, serverIcon, null, null, null, true)], components: [], ephemeral: true });
                } else {
                    await reply.edit({ embeds: [emb.generate(null, null, `La feature ${features} a bien été supprimée de la liste des features !`, `#0DE600`, process.env.LSMS_LOGO_V2, null, authorTitleEmbed, serverIcon, null, null, null, true)], components: [], ephemeral: true });
                }
                // Supprime la réponse après 5s
                await wait(5000);
                await reply.delete();
            } catch (err) {
                logger.error(err);
                if(interaction.values.length > 1) {
                    interaction.followUp({ embeds: [emb.generate(null, null, `Les features ${features} ont bien été supprimées de la liste des features !`, `#0DE600`, process.env.LSMS_LOGO_V2, null, authorTitleEmbed, serverIcon, null, null, null, true)], ephemeral: true });
                } else {
                    interaction.followUp({ embeds: [emb.generate(null, null, `La feature ${features} a bien été supprimée de la liste des features !`, `#0DE600`, process.env.LSMS_LOGO_V2, null, authorTitleEmbed, serverIcon, null, null, null, true)], ephemeral: true });
                }
                // Supprime la réponse après 5s
                await wait(5000);
                await interaction.deleteReply();
            }
        } else if(interaction.customId == 'featureUpdateSelect') {
            try { await reply.edit({ embeds: [emb.generate(null, null, `<a:loading:1140500830672392283> Récupération des informations...`, `Gold`, process.env.LSMS_LOGO_V2, null, authorTitleEmbed, serverIcon, null, null, null, false)], components: [], ephemeral: true }); } catch (err) {}
            let featureVar = await featureSQL.getFeature(interaction.values[0]);
            const updateFeatureModal = new ModalBuilder().setCustomId('updateFeatureModal').setTitle('Mise à jour d\'une feature');
            const type = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('type').setLabel('Type de feature').setStyle(TextInputStyle.Short).setPlaceholder('0 = Fix, 1 = Update, 2 = New, 3 = Delete').setValue(`${featureVar.type}`).setRequired(true))
            const name = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('name').setLabel('Titre de la feature').setStyle(TextInputStyle.Short).setPlaceholder('Titre de la feature').setValue(`${featureVar.name}`).setRequired(true))
            const feature = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('feature').setLabel('Description de la feature').setStyle(TextInputStyle.Short).setPlaceholder('Description de la feature').setValue(`${featureVar.feature}`).setRequired(true))
            const id = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('id').setLabel('ID de la feature (NE PAS TOUCHER)').setStyle(TextInputStyle.Short).setPlaceholder('ID de la feature (NE PAS TOUCHER)').setValue(`${featureVar.id}`).setRequired(true))
            updateFeatureModal.addComponents(type, name, feature, id)
            await interaction.showModal(updateFeatureModal)
            try {
                await reply.delete();
            } catch (err) {
                logger.error(err);
            }
        }
    }
}
