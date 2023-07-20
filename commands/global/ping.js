// Récupération des fonctions pour créer une commande
const { SlashCommandBuilder } = require('discord.js');
// Récupération du logger
const logger = require('../../modules/logger');
// Récupération du créateur d'embed
const emb = require('../../modules/embeds');

// Constantes pour les seuils de ping
const PING_THRESHOLD = {
    VERY_GOOD: 50,
    GOOD: 100,
    CORRECT: 150,
    WEAK: 200,
    BAD: 500,
};

module.exports = {
    // Création de la commande
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    async execute(interaction) {
        try {
            //Calcul du statut du ping
            let status;
            switch (true) {
                case interaction.client.ws.ping < 0:
                    status = "Pas normal !";
                    break;
                //Si le ping est inférieur à 50ms
                case interaction.client.ws.ping < PING_THRESHOLD.VERY_GOOD:
                    status = "Très bon";
                    break;
                //Si le ping est inférieur à 100ms
                case interaction.client.ws.ping < PING_THRESHOLD.GOOD:
                    status = "Bon";
                    break;
                //Si le ping est inférieur à 150ms
                case interaction.client.ws.ping < PING_THRESHOLD.CORRECT:
                    status = "Correct";
                    break;
                //Si le ping est inférieur à 200ms
                case interaction.client.ws.ping < PING_THRESHOLD.WEAK:
                    status = "Faible";
                    break;
                //Si le ping est inférieur à 500ms
                case interaction.client.ws.ping < PING_THRESHOLD.BAD:
                    status = "Mauvais";
                    break;
                //Si le ping est supérieur à 500ms
                default:
                    status = "Très mauvais";
            }

            //Fonction pour formater la mémoire
            const formatM = (data) => {
                `${Math.round(data / 1024 / 1024 * 100) / 100} MB`;
            };
            //Récupération des données de la mémoire
            const memoryData = process.memoryUsage();

            //Création de l'embed
            const pingEmbed = emb.generate(null,null,`🏓 **Pong !**\n- **Ping :** ${interaction.client.ws.ping} ms (${status})\n- **Latence :** ${interaction.createdTimestamp - Date.now()}ms\n- **Mémoire :** ${formatM(memoryData.heapUsed)}\n- **En ligne depuis :** <t:${(new Date() / 1000 - interaction.client.uptime / 1000).toFixed()}:R>`,`Gold`,null,null,null,null,null,interaction.client.user.username,interaction.client.user.avatarURL(),true);

            //Envoi de l'embed
            return interaction.reply({ embeds: [pingEmbed], ephemeral: true });
        } catch (error) {
            logger.error(error);
        }
    },
};
