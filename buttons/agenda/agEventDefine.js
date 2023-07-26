const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
//Récup du logger
const logger = require('../../modules/logger');
//Récup des requêtes SQL
const sql = require('../../sql/agenda/agenda');

module.exports = {
    execute: async function(interaction, errEmb) {
        const rendezVousEmb = interaction.message.embeds[0];
        const agEventDefineModal = new ModalBuilder().setCustomId(`agEventDefineModal`).setTitle(`Définir la cérémonie de ${rendezVousEmb.fields[0].value}`);
        const date = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId(`date`).setLabel(`Date et heure de la cérémonie`).setStyle(TextInputStyle.Short).setPlaceholder("JJ/MM/AAAA HH:mm").setRequired(true));
        const lieu = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId(`lieu`).setLabel(`Lieu de la cérémonie`).setStyle(TextInputStyle.Short).setPlaceholder(`Ex: Cimetière de Los Santos`).setRequired(true));
        agEventDefineModal.addComponents(date, lieu);
        await interaction.showModal(agEventDefineModal);
    }
}
