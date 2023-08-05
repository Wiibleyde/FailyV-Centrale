//Récupération des fonctions pour créer une commande
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
//Récup du logger
const logger = require('../../modules/logger');
//Récup du créateur d'embed
const emb = require('../../modules/embeds');
//Fonction pour attendre
const wait = require('node:timers/promises').setTimeout;
//Récupération du module sql pour les features
const featureSQL = require('../../sql/patchnote/feature');

module.exports = {
    execute: async function (interaction, errEmb) {
        let featureVar = await featureSQL.getFeature(interaction.values[0]);
        const updateFeatureModal = new ModalBuilder().setCustomId('updateFeatureModal').setTitle('Mise à jour d\'une feature');
        const type = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('type').setLabel('Type de feature').setStyle(TextInputStyle.Short).setPlaceholder('0 = Fix, 1 = Update, 2 = New, 3 = Delete').setValue(`${featureVar.type}`).setRequired(true))
        const name = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('name').setLabel('Titre de la feature').setStyle(TextInputStyle.Short).setPlaceholder('Titre de la feature').setValue(`${featureVar.name}`).setRequired(true))
        const feature = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('feature').setLabel('Description de la feature').setStyle(TextInputStyle.Short).setPlaceholder('Description de la feature').setValue(`${featureVar.feature}`).setRequired(true))
        const id = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('id').setLabel('ID de la feature (NE PAS TOUCHER)').setStyle(TextInputStyle.Short).setPlaceholder('ID de la feature (NE PAS TOUCHER)').setValue(`${featureVar.id}`).setRequired(true))
        updateFeatureModal.addComponents(type, name, feature, id)
        await interaction.showModal(updateFeatureModal)
    }
}