//Récup des fonctions pour créer des boutons
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
//Récup du logger
const logger = require('../../modules/logger');
//Récup des requêtes SQL
const sql = require('../../sql/objectsManagement/vehicule');

module.exports = {
    execute: async function(interaction, errEmb) {
        //Ajout des boutons sous l'embed pour gérer le véhicule
        const vehiclesBtns = new ActionRowBuilder();
        const plate = interaction.message.content.split(" \u200b- ")[1];
        if(interaction.customId == 'vehAvailable') {
            vehiclesBtns.addComponents(
                new ButtonBuilder().setCustomId('vehAvailable').setStyle(ButtonStyle.Success).setEmoji("896393106700775544").setDisabled(true),
                new ButtonBuilder().setCustomId('vehNeedRepair').setStyle(ButtonStyle.Secondary).setEmoji("🔧").setDisabled(false),
                new ButtonBuilder().setCustomId('vehUnavailable').setStyle(ButtonStyle.Secondary).setEmoji("896393106633687040").setDisabled(false),
                new ButtonBuilder().setCustomId('vehEditCt').setStyle(ButtonStyle.Secondary).setEmoji("📆").setDisabled(false)
            );
            await sql.updateState('0', plate);
        } else if(interaction.customId == 'vehNeedRepair') {
            vehiclesBtns.addComponents(
                new ButtonBuilder().setCustomId('vehAvailable').setStyle(ButtonStyle.Secondary).setEmoji("896393106700775544").setDisabled(false),
                new ButtonBuilder().setCustomId('vehNeedRepair').setStyle(ButtonStyle.Primary).setEmoji("🔧").setDisabled(true),
                new ButtonBuilder().setCustomId('vehUnavailable').setStyle(ButtonStyle.Secondary).setEmoji("896393106633687040").setDisabled(false),
                new ButtonBuilder().setCustomId('vehEditCt').setStyle(ButtonStyle.Secondary).setEmoji("📆").setDisabled(false)
            );
            await sql.updateState('1', plate);
        } else {
            vehiclesBtns.addComponents(
                new ButtonBuilder().setCustomId('vehAvailable').setStyle(ButtonStyle.Secondary).setEmoji("896393106700775544").setDisabled(false),
                new ButtonBuilder().setCustomId('vehNeedRepair').setStyle(ButtonStyle.Secondary).setEmoji("🔧").setDisabled(false),
                new ButtonBuilder().setCustomId('vehUnavailable').setStyle(ButtonStyle.Danger).setEmoji("896393106633687040").setDisabled(true),
                new ButtonBuilder().setCustomId('vehEditCt').setStyle(ButtonStyle.Secondary).setEmoji("📆").setDisabled(false)
            );
            await sql.updateState('2', plate);
        }
        interaction.message.edit({ content: interaction.message.content, components: [vehiclesBtns] });
        interaction.deferUpdate();
    }
}