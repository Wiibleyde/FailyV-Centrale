//Récupération des fonctions pour créer une commande et un modal
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
//Récup du logger
const logger = require('../../modules/logger');

module.exports = {
    execute: async function(interaction, errEmb) {
        const vehPlate = interaction.message.content.split("[0m[2;34m")[2];
        const vehEditCtModal = new ModalBuilder().setCustomId(`vehEditCtModal`).setTitle(`Mettre à jour la date du contrôle technique`);
        const ct = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId(`ct`).setLabel(`Nouvelle date du contrôle technique`).setStyle(TextInputStyle.Short).setPlaceholder("Ex: JJ/MM/AAAA").setRequired(true));
        const plate = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId(`plate`).setLabel(`Plaque d'immatriculation du véhicule`).setStyle(TextInputStyle.Short).setValue(vehPlate).setPlaceholder("Ex: LSMS 830").setRequired(true));
        vehEditCtModal.addComponents(ct, plate);
        await interaction.showModal(vehEditCtModal);
    }
}