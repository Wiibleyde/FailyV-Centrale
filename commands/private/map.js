// Récupération des fonctions pour créer une commande
const { SlashCommandBuilder } = require('discord.js');
// Récupération du logger
const logger = require('../../modules/logger');
// Récupération du créateur d'embed
const emb = require('../../modules/embeds');

module.exports = {
    // Création de la commande
    data: new SlashCommandBuilder()
        .setName('map')
        .setDescription('Mettre à pied une personne')
        .addUserOption(option =>
            option.setName('membre')
            .setDescription('La personne à mettre à pied')
            .setRequired(true)
        ).addStringOption(option => 
            option.setName('type')
            .setDescription('Type de mise à pied')
            .addChoices(
                {
                    name: 'Classique',
                    value: '0'
                },
                {
                    name: 'Conservatoire',
                    value: '1'
                }
            )
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
