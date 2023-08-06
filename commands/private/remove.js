// Récupération des fonctions pour créer une commande
const { SlashCommandBuilder } = require('discord.js');
// Récupération du logger
const logger = require('../../modules/logger');
// Récupération du créateur d'embed
const emb = require('../../modules/embeds');

module.exports = {
    // Création de la commande
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription(`Retirer une personne de l'effectif du LSMS`)
        .addUserOption(option =>
            option.setName('membre')
            .setDescription('La personne à retirer')
            .setRequired(true)
        ).addStringOption(option => 
            option.setName('type')
            .setDescription('Le type de départ de la personne')
            .addChoices(
                {
                    name: 'Démission',
                    value: '0'
                },
                {
                    name: 'Licenciement',
                    value: '1'
                },
                {
                    name: 'Décès',
                    value: '2'
                }
            )
            .setRequired(true)
        ).addStringOption(option =>
            option.setName('raison')
            .setDescription(`La raison du retrait de la personne de l'effectif`)
            .setRequired(false)
        ),
    async execute(interaction) {
    },
};
