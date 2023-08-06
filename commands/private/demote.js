// Récupération des fonctions pour créer une commande
const { SlashCommandBuilder } = require('discord.js');
// Récupération du logger
const logger = require('../../modules/logger');
// Récupération du créateur d'embed
const emb = require('../../modules/embeds');

module.exports = {
    // Création de la commande
    data: new SlashCommandBuilder()
        .setName('demote')
        .setDescription('Rétrograder/Retirer un rôle à la personne sélectionnée')
        .addUserOption(option =>
            option.setName('membre')
            .setDescription('La personne à rétrograder')
            .setRequired(true)
        ).addRoleOption(option => 
            option.setName('rôle')
            .setDescription('Le rôle à retirer')
            .setRequired(true)
        ).addStringOption(option => 
            option.setName('visibilité')
            .setDescription('Visibilité de la sanction')
            .addChoices(
                {
                    name: 'Privé',
                    value: '0'
                },
                {
                    name: 'Publique',
                    value: '1'
                }
            )
            .setRequired(false)
        ),
    async execute(interaction) {
    },
};
