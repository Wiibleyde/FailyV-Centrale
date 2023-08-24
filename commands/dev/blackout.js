// Récupération des fonctions pour créer une commande
const { SlashCommandBuilder } = require('discord.js');

const blackout = require('../../modules/blackout');

module.exports = {
    // Création de la commande
    data: new SlashCommandBuilder()
        .setName('blackout')
        .setDescription('[DEV ONLY] Enable or disable the blackout mode!'),
    execute(interaction) {
        blackout.execute(interaction);
    },
};
