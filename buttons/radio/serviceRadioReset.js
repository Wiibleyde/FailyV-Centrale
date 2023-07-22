//Récupération des fonctions pour créer une liste
const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');

module.exports = {
    execute: async function(interaction, errEmb) {
        //Création d'une liste d'opération possible
        const options = new StringSelectMenuBuilder().setCustomId('centraleResetRadioSelect').setPlaceholder('Choisissez la/les radio(s) à réinitialiser').setMinValues(1).setMaxValues(2);
        //Ajout des opérations possibles
        options.addOptions(new StringSelectMenuOptionBuilder().setLabel(`BCMS`).setValue(`BCMS`).setEmoji('1124910870695256106'));
        options.addOptions(new StringSelectMenuOptionBuilder().setLabel(`Event`).setValue(`évènementielle`).setEmoji('1121278617960329257'));
        const allOptions = new ActionRowBuilder().addComponents(options);
        try {
            //Confirmation à Discord du succès de l'opération
            await interaction.reply({ components: [allOptions], ephemeral: true });
        } catch (err) {
            await logger.error(err);
            //Confirmation à Discord du succès de l'opération
            await interaction.reply({ embeds: [errEmb], ephemeral: true });
        }
        //Reset des radios
    }
}