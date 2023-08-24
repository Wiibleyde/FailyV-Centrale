//Récupération des fonctions pour créer une commande
const { SlashCommandBuilder } = require('discord.js');

const workforce = require('../../modules/regenerateWorkforce');

module.exports = {
    //Création de la commande
    data: new SlashCommandBuilder()
        .setName('regenerate_workforce')
        .setDescription("[DEV ONLY] Regénération de l'effectif"),
    execute(interaction) {
        workforce.execute(interaction);
    },
};
