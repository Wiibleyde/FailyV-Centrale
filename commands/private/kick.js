//Récupération des fonctions pour créer une commande
const { SlashCommandBuilder } = require('discord.js');
//Récup du logger
const logger = require('../../modules/logger');
//Récup du créateur d'embed
const emb = require('../../modules/embeds');
//Récup du service de kick
const service = require('../../modules/kickservice');
//Fonction pour attendre
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    //Création de la commande
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Retirer toutes les personnes en service'),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        service.kick(interaction.guild, interaction.guild.members.cache.get(interaction.user.id));
        interaction.followUp({ embeds: [emb.generate(null, null, `Toutes les personnes ont correctement été retirées du service !`, `#0DE600`, process.env.LSMS_LOGO_V2, null, `Gestion du service`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).icon}.webp`, null, null, null, true)], ephemeral: true });
        // Supprime la réponse après 5s
        await wait(5000);
        await interaction.deleteReply();
    }
};