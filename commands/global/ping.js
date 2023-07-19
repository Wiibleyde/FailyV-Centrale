//Récupération des fonctions pour créer une commande
const { SlashCommandBuilder } = require('discord.js');
//Récup du logger
const logger = require('./../modules/logger');
//Récup du créateur d'embed
const emb = require('./../modules/embeds');

module.exports = {
    //Création de la commande
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    async execute(interaction) {
        //Affichage du message "Iris réfléchis..."
        const waitMsg = await interaction.deferReply({ ephemeral: true });
        //Format de la date de démarrage
        const time = new Date(`${logger.getStartDate()} GMT+2:00`);
        const logged_at = Math.floor(time / 1000);
        //Action lors de l'execution de la commande
        await interaction.followUp({ embeds: [emb.generate(null, null, `🏓 Pong ! \n- **Ping :** ${waitMsg.createdTimestamp - interaction.createdTimestamp} ms \n- **Latence :** ${Math.round(interaction.client.ws.ping)}ms \n- **Mémoire :** ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100} MB \n- **En ligne depuis : <t:${logged_at}:R>** `, `Gold`, null, null, null, null, null, interaction.client.user.username, interaction.client.user.avatarURL(), true)], ephemeral: true });
    },
};