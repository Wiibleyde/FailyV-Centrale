//Récupération des fonctions pour créer une commande
const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
//Récup du logger
const logger = require('../../modules/logger');
//Récup du créateur d'embed
const emb = require('../../modules/embeds');
//Fonction pour attendre
const wait = require('node:timers/promises').setTimeout;
//Récupération du module sql pour les patchnotes
const patchnoteSQL = require('../../sql/patchnote/patchnote');
//Récupération du module sql pour les features
const featureSQL = require('../../sql/patchnote/feature');
//Récupération du module sql pour les channels
const channelSQL = require('../../sql/config/config');

let reply;

const typeEmojis = {
    0: `🔧`,
    1: `🔨`,
    2: `🆕`,
    3: `🗑️`
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('patchnote')
        .setDescription('Gestion des patchnotes')
        .addStringOption(option =>
            option.setName('action')
                .setDescription('Action à effectuer')
                .addChoices(
                    {
                        name: 'Créer un patchnote',
                        value: 'create'
                    },
                    {
                        name: 'Supprimer le patchnote',
                        value: 'delete'
                    },
                    {
                        name: 'Ajouter des features à un patchnote',
                        value: 'add'
                    },
                    {
                        name: 'Supprimer des features à un patchnote',
                        value: 'remove'
                    },
                    {
                        name: 'Voir le dernier patchnote',
                        value: 'view'
                    },
                    {
                        name: 'Envoyer le dernier patchnote',
                        value: 'send'
                    }
                )
                .setRequired(true)
        ),
    async execute(interaction) {
        if(interaction.commandName == 'patchnote') {
            if(interaction.user.id == '461880599594926080' || interaction.user.id == '461807010086780930' || interaction.user.id == '368259650136571904') {
                const lastPatchnote = await patchnoteSQL.getLastPatchnote();
                switch(interaction.options.getString(`action`)) {
                    case `create`:
                        if (lastPatchnote.state == undefined || lastPatchnote.state == 1) {
                            const addPatchnoteModal = new ModalBuilder().setCustomId('addPatchnoteModal').setTitle('Créer un patchnote');
                            const name = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('name').setLabel('Nom du patchnote').setStyle(TextInputStyle.Short).setPlaceholder('Nom du patchnote').setRequired(true))
                            const version = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('version').setLabel(`Version du patchnote${lastPatchnote.version}`).setStyle(TextInputStyle.Short).setPlaceholder('Version du patchnote').setRequired(true))
                            addPatchnoteModal.addComponents(name, version);
                            await interaction.showModal(addPatchnoteModal);
                            break;
                        } else {
                            let embed = emb.generate(`Gestion des patchnotes`, null, `Désolé :(\n\Il n'y aucun patchnote enregistré !\nEnvoyez le ou supprimez le avant d'en créer un autre.`, `#FF0000`, process.env.LSMS_LOGO_V2, null, null, null, null, interaction.client.user.username, interaction.client.user.avatarURL(), true)
                            await interaction.reply({ embeds: [embed], ephemeral: true });
                            break;
                        }
                    case `delete`:
                        let embed = emb.generate(`Gestion des patchnotes`, null, `Le dernier patchnote a été supprimé`, `#0DE600`, process.env.LSMS_LOGO_V2, null, null, null, null, interaction.client.user.username, interaction.client.user.avatarURL(), true)                    
                        await patchnoteSQL.deleteLastPatchnote();
                        await interaction.reply({ embeds: [embed], ephemeral: true });
                        break;
                    case `add`:
                        if (lastPatchnote.state != undefined) {
                            reply = null;
                            const featuresToAdd = await featureSQL.getFeaturesNotSent();
                            let options = new StringSelectMenuBuilder().setCustomId('addFeaturePatchnoteSelect').setPlaceholder('Choisissez les features à ajouter au patchnote').setMinValues(1)
                            let totalFeatures = 0
                            featuresToAdd.forEach(feature => {
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
                                    break;
                                }
                            } else {
                                let embed = emb.generate(`Gestion des patchnotes`, null, `Liste des features`, `#0DE600`, process.env.LSMS_LOGO_V2, null, null, null, null, interaction.client.user.username, interaction.client.user.avatarURL(), true)
                                embed.addFields(
                                    {
                                        name: `Aucune feature`,
                                        value: `Aucune feature non envoyé n'a été trouvée`
                                    }
                                )
                                await interaction.reply({ embeds: [embed], ephemeral: true })
                                // Supprime la réponse après 5s
                                await wait(5000);
                                await interaction.deleteReply();
                            }
                        } else {
                            let embed = emb.generate(`Gestion des patchnotes`, null, `Désolé :(\n\nIl n'y a pas de patchnote en cours de création !\nCréez en un avant d'ajouter des features.`, `#FF0000`, process.env.LSMS_LOGO_V2, null, null, null, null, interaction.client.user.username, interaction.client.user.avatarURL(), true)
                            await interaction.reply({ embeds: [embed], ephemeral: true });
                            break;
                        }
                        break;
                    case `remove`:
                        if (lastPatchnote.state != undefined) {
                            reply = null;
                            let features = lastPatchnote.features_id
                            if(features == '') {
                                let embed = emb.generate(`Gestion des patchnotes`, null, `Désolé :(\n\nIl n'y a pas de feature dans le patchnote en cours de création !\nAjoutez en avant d'en supprimer.`, `#FF0000`, process.env.LSMS_LOGO_V2, null, null, null, null, interaction.client.user.username, interaction.client.user.avatarURL(), true)
                                await interaction.reply({ embeds: [embed], ephemeral: true });
                                break;
                            }
                            features = features.split(';')
                            let options = new StringSelectMenuBuilder().setCustomId('removeFeaturePatchnoteSelect').setPlaceholder('Choisissez les features à supprimer du patchnote').setMinValues(1)
                            let totalFeatures = 0
                            for (let i = 0; i < features.length; i++) {
                                let featureInfos = await featureSQL.getFeature(features[i])
                                options.addOptions(new StringSelectMenuOptionBuilder().setLabel(`${typeEmojis[featureInfos.type]} : ${featureInfos.name}`).setValue(`${featureInfos.id}`))
                                totalFeatures++
                            }
                            options.setMaxValues(totalFeatures)
                            if(totalFeatures != 0) {
                                const allOptions = new ActionRowBuilder().addComponents(options);
                                try {
                                    reply = await interaction.reply({ components: [allOptions], ephemeral: true })
                                } catch (err) {
                                    logger.error(err)
                                    break;
                                }
                            } else {
                                let embed = emb.generate(`Gestion des patchnotes`, null, `Liste des features`, `#0DE600`, process.env.LSMS_LOGO_V2, null, null, null, null, interaction.client.user.username, interaction.client.user.avatarURL(), true)
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
                        } else {
                            let embed = emb.generate(`Gestion des patchnotes`, null, `Désolé :(\n\nIl n'y a pas de patchnote en cours de création !\nCréez en un avant de supprimer des features.`, `#FF0000`, process.env.LSMS_LOGO_V2, null, null, null, null, interaction.client.user.username, interaction.client.user.avatarURL(), true)
                            await interaction.reply({ embeds: [embed], ephemeral: true });
                            // Supprime la réponse après 5s
                            await wait(5000);
                            await interaction.deleteReply();
                            break;
                        }
                        break;
                    case `view`:
                        if (lastPatchnote.state != undefined) {
                            let viewEmbed = emb.generate(`Gestion des patchnotes`, null, `Dernier patchnote : ${lastPatchnote.name} - ${lastPatchnote.version}`, `#0DE600`, process.env.LSMS_LOGO_V2, null, null, null, null, interaction.client.user.username, interaction.client.user.avatarURL(), true)
                            if (lastPatchnote.features_id == "") {
                                viewEmbed.addFields(
                                    {
                                        name: `Aucune feature`,
                                        value: `Aucune feature n'a été trouvée`
                                    }
                                )
                                await interaction.reply({ embeds: [viewEmbed], ephemeral: true })
                                // Supprime la réponse après 5s
                                await wait(5000);
                                await interaction.deleteReply();
                                break;
                            }
                            let features = lastPatchnote.features_id.split(`;`)
                            for (let i = 0; i < features.length; i++) {
                                let featureInfos = await featureSQL.getFeature(features[i])
                                viewEmbed.addFields(
                                    {
                                        name: `${typeEmojis[featureInfos.type]} : ${featureInfos.name}`,
                                        value: `${featureInfos.feature}`
                                    }
                                )
                            }
                            await interaction.reply({ embeds: [viewEmbed], ephemeral: true })
                        } else {
                            let embed = emb.generate(`Gestion des patchnotes`, null, `Désolé :(\n\nIl n'y a pas de patchnote en cours de création !\nCréez en un avant de le voir.`, `#FF0000`, process.env.LSMS_LOGO_V2, null, null, null, null, interaction.client.user.username, interaction.client.user.avatarURL(), true)
                            await interaction.reply({ embeds: [embed], ephemeral: true });
                            // Supprime la réponse après 5s
                            await wait(5000);
                            await interaction.deleteReply();
                        }
                        break;
                    case `send`:
                        if (lastPatchnote.state != undefined) {
                            let embed = emb.generate(`Nouvelle mise à jour de ${interaction.client.user.username}, la **${lastPatchnote.version}** !`, null, `**${lastPatchnote.name}** - **${lastPatchnote.version}**`, `#0DE600`, process.env.LSMS_LOGO_V2, null, null, null, null, interaction.client.user.username, interaction.client.user.avatarURL(), true)
                            let features = lastPatchnote.features_id.split(`;`)
                            if(features[0] == "") {
                                let embed = emb.generate(`Gestion des patchnotes`, null, `Désolé :(\n\nIl n'y a pas de feature dans ce patchnote !\nAjoutez en avant de l'envoyer.`, `#FF0000`, process.env.LSMS_LOGO_V2, null, null, null, null, interaction.client.user.username, interaction.client.user.avatarURL(), true)
                                await interaction.reply({ embeds: [embed], ephemeral: true });
                                // Supprime la réponse après 5s
                                await wait(5000);
                                await interaction.deleteReply();
                                break;
                            }
                            let featureSorted = await sortByType(features)
                            let featureList = []
                            fixes = {
                                name: `${typeEmojis[0]} - Corrections`,
                                value: `${featureSorted.fix}`
                            }
                            changes = {
                                name: `${typeEmojis[1]} - Changements`,
                                value: `${featureSorted.upgrade}`
                            }
                            news = {
                                name: `${typeEmojis[2]} - Nouveautés`,
                                value: `${featureSorted.new}`
                            }
                            deletations = {
                                name: `${typeEmojis[3]} - Suppressions`,
                                value: `${featureSorted.delete}`
                            }
                            featureList.push(fixes, changes, news, deletations)
                            for (let i = 0; i < featureList.length; i++) {
                                if (featureList[i].value != ``) {
                                    embed.addFields(featureList[i])
                                }
                            }
                            let channel = await channelSQL.getChannel(`IRIS_PATCHNOTE_CHANNEL_ID`)
                            const patchnoteChannel = interaction.client.channels.cache.get(channel[0].id)
                            await patchnoteChannel.send({ embeds: [embed] })
                            await patchnoteSQL.updateState(lastPatchnote.id, 1)
                            await interaction.reply({ embeds: [emb.generate(`Gestion des patchnotes`, null, `Le patchnote a été envoyé.`, `#0DE600`, process.env.LSMS_LOGO_V2, null, null, null, null, interaction.client.user.username, interaction.client.user.avatarURL(), true)], ephemeral: true });
                        } else {
                            let embed = emb.generate(`Gestion des patchnotes`, null, `Désolé :(\n\nIl n'y a pas de patchnote en cours de création !\nCréez en un avant de l'envoyer.`, `#FF0000`, process.env.LSMS_LOGO_V2, null, null, null, null, interaction.client.user.username, interaction.client.user.avatarURL(), true)
                            await interaction.reply({ embeds: [embed], ephemeral: true });
                            // Supprime la réponse après 5s
                            await wait(5000);
                            await interaction.deleteReply();
                        }
                        break;
                    default:
                        break;
                }
            } else {
                interaction.reply({ embeds: [emb.generate(null, null, `Désolé :(\n\nCette commande est réservé à mes développeurs (<@461880599594926080>, <@461807010086780930> et <@368259650136571904>) au cas où j'aurais un soucis !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, `DEBUG MODE`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, true)], ephemeral: true });
            }
        } else if(interaction.customId == 'addFeaturePatchnoteSelect') {
            try {
                await reply.edit({ embeds: [emb.generate(null, null, `<a:loading:1137771560531398697> Mise à jour en cours...`, `Gold`, process.env.LSMS_LOGO_V2, null, `Gestion des features`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], components: [], ephemeral: true });
            } catch (err) {
                await interaction.deferReply({ ephemeral: true });
            }
            //Récupération des features
            let oldFeatures = await patchnoteSQL.getLastPatchnote();
            let features = `${oldFeatures.features_id};`
            if(features == ";") {
                features = ""
            }
            for (i=0;i<interaction.values.length;i++) {
                if(i == interaction.values.length - 1) {
                    features = features + interaction.values[i]
                    featureSQL.updateState(interaction.values[i], 1)
                } else {
                    features = features + interaction.values[i] + ";"
                    featureSQL.updateState(interaction.values[i], 1)
                }
            }
            await patchnoteSQL.addFeatureToLastPatchnote(features);
            try {
                await reply.edit({ embeds: [emb.generate(null, null, `Les features ${features} sont présentes dans le dernier patchnote !`, `#0DE600`, process.env.LSMS_LOGO_V2, null, `Gestion des features`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, true)], components: [], ephemeral: true });
                // Supprime la réponse après 5s
                await wait(5000);
                await reply.delete();
            } catch (err) {
                logger.error(err);
                await interaction.followUp({ embeds: [emb.generate(null, null, `Les features ${features} sont présentes dans le dernier patchnote !`, `#0DE600`, process.env.LSMS_LOGO_V2, null, `Gestion des features`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, true)], ephemeral: true });
                // Supprime la réponse après 5s
                await wait(5000);
                await interaction.deleteReply();
            }
        } else if(interaction.customId == 'removeFeaturePatchnoteSelect') {
            try {
                await reply.edit({ embeds: [emb.generate(null, null, `<a:loading:1137771560531398697> Mise à jour en cours...`, `Gold`, process.env.LSMS_LOGO_V2, null, `Gestion des features`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], components: [], ephemeral: true });
            } catch (err) {
                await interaction.deferReply({ ephemeral: true });
            }
            //Récupération des features
            let oldFeatures = await patchnoteSQL.getLastPatchnote();
            let features = oldFeatures.features_id.split(";")
            for (i=0;i<interaction.values.length;i++) {
                if(features.includes(interaction.values[i])) {
                    features.splice(features.indexOf(interaction.values[i]), 1)
                    featureSQL.updateState(interaction.values[i], 0)
                }
            }
            features = features.join(";")
            await patchnoteSQL.addFeatureToLastPatchnote(features);
            try {
                await reply.edit({ embeds: [emb.generate(null, null, `Les features ${features} sont présentes dans le dernier patchnote !`, `#0DE600`, process.env.LSMS_LOGO_V2, null, `Gestion des features`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, true)], components: [], ephemeral: true });
                // Supprime la réponse après 5s
                await wait(5000);
                await reply.delete();
            } catch (err) {
                logger.error(err);
                await interaction.followUp({ embeds: [emb.generate(null, null, `Les features ${features} sont présentes dans le dernier patchnote !`, `#0DE600`, process.env.LSMS_LOGO_V2, null, `Gestion des features`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, true)], ephemeral: true });
                // Supprime la réponse après 5s
                await wait(5000);
                await interaction.deleteReply();
            }
        }
    }
}

async function sortByType(features) {
    // Type possibles : 0 = fix, 1 = upgrade, 2 = new, 3 = delete
    let fix = ``
    let upgrade = ``
    let newFeature = ``
    let deleteFeature = ``
    for (let i = 0; i < features.length; i++) {
        let featureInfos = await featureSQL.getFeature(features[i])
        switch (featureInfos.type) {
            case '0':
                fix += `- **${featureInfos.name}**\n  - ${featureInfos.feature}\n`
                break;
            case '1':
                upgrade += `- **${featureInfos.name}**\n  - ${featureInfos.feature}\n`
                break;
            case '2':
                newFeature += `- **${featureInfos.name}**\n  - ${featureInfos.feature}\n`
                break;
            case '3':
                deleteFeature += `- **${featureInfos.name}**\n  - ${featureInfos.feature}\n`
                break;
            default:
                break;
        }
    }
    let toReturn = {}
    if (fix != undefined) {
        toReturn.fix = fix
    }
    if (upgrade != undefined) {
        toReturn.upgrade = upgrade
    }
    if (newFeature != undefined) {
        toReturn.new = newFeature
    }
    if (deleteFeature != undefined) {
        toReturn.delete = deleteFeature
    }
    return toReturn
}