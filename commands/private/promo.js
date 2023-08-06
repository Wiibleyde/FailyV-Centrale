// Récupération des fonctions pour créer une commande
const { SlashCommandBuilder } = require('discord.js');
// Récupération du logger
const logger = require('../../modules/logger');
// Récupération du créateur d'embed
const emb = require('../../modules/embeds');

module.exports = {
    // Création de la commande
    data: new SlashCommandBuilder()
        .setName('promo')
        .setDescription('Promouvoir/Ajouter un rôle à la personne sélectionnée')
        .addUserOption(option =>
            option.setName('membre')
            .setDescription('La personne à promouvoir')
            .setRequired(true)
        ).addRoleOption(option => 
            option.setName('rôle')
            .setDescription('Le nouveau rôle à attribuer')
            .setRequired(true)
        ),
    async execute(interaction) {
    },
};
