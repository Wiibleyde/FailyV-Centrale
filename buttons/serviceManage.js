//Récupération des fonctions pour créer une liste
const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
//Récup du logger
const logger = require('./../modules/logger');
//Récup du créateur d'embed
const emb = require('./../modules/embeds');

module.exports = {
    execute: async function(interaction, errEmb) {
        //Création d'une liste d'opération possible
        var options = new StringSelectMenuBuilder().setCustomId('serviceManageSelect').setPlaceholder('Que souhaitez vous faire ?');
        //Ajout des opérations possibles
        options.addOptions(new StringSelectMenuOptionBuilder().setLabel('Reset les radios').setValue('serviceRadioReset'));
        const allOptions = new ActionRowBuilder().addComponents(options);
        //Envois
        try {
            await interaction.reply({ components: [allOptions], ephemeral: true });
        } catch (err) {
            logger.error(err);
            await interaction.reply({ embeds: [errEmb] });
        }
    }
}