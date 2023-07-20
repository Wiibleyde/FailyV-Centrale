//Récupération des fonctions pour créer une commande
const { SlashCommandBuilder, ChannelType } = require('discord.js');
//Récup du logger
const logger = require('../../modules/logger');
// Récup du gestionnaire d'autoriasation
const { Rank, hasAuthorization } = require('../../modules/rankAuthorization');
//Récup du créateur d'embed
const emb = require('../../modules/embeds');
//Récup du générateur d'effectif
const workforce = require('../../modules/workforce');

module.exports = {
    //Création de la commande
    data: new SlashCommandBuilder()
        .setName('regenerate_workforce')
        .setDescription("[Direction] Regénération de l'effectif"),
    async execute(interaction) {
        //Affichage du message "Iris réfléchis..."
        await interaction.deferReply({ ephemeral: true });
        await interaction.deleteReply();

        await workforce.generateWorkforce(interaction.guild);
    },
};
