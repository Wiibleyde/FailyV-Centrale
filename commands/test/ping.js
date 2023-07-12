//Récupération des fonctions pour créer une commande
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    //Création de la commande
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    async execute(interaction) {
    //Action lors de l'execution de la commande
        await interaction.reply({ content: 'Pong!', ephemeral: true });
    },
};