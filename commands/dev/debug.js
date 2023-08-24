//Récupération des fonctions pour créer une commande
const { SlashCommandBuilder } = require('discord.js');

const debug = require('../../modules/debug');

module.exports = {
    //Création de la commande
    data: new SlashCommandBuilder()
        .setName('debug')
        .setDescription('[DEV ONLY] Activer/Désactiver le mode debug'),
    execute(interaction) {
        debug.execute(interaction)
    }
};