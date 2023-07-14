//Récupération des fonctions pour créer une commande
const { SlashCommandBuilder } = require('discord.js');
//Récup du logger
const logger = require('../../modules/logger');
//Récup du créateur d'embed
const emb = require('../../modules/embeds');
//Récup du systeme de logs RP
const logRP = require('./../../modules/logsRP');
//Fonction pour attendre
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    //Création de la commande
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Retirer toutes les personnes en service'),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const serviceRole = interaction.guild.roles.cache.get(process.env.IRIS_SERVICE_ROLE_ID);
        const dispatchRole = interaction.guild.roles.cache.get(process.env.IRIS_DISPATCH_ROLE_ID);
        const offole = interaction.guild.roles.cache.get(process.env.IRIS_OFF_ROLE_ID);
        const allMembers = serviceRole.members;
        allMembers.map(d => {
            d.roles.remove(serviceRole);
            logRP.fds(interaction.guild, d.nickname, interaction.guild.members.cache.get(interaction.user.id).nickname);
            if(d.roles.cache.has(process.env.IRIS_DISPATCH_ROLE_ID)) {
                logRP.fdd(interaction.guild, d.nickname, interaction.guild.members.cache.get(interaction.user.id).nickname);
            }
            d.roles.remove(dispatchRole);
            d.roles.remove(offole);
        });
        interaction.followUp({ embeds: [emb.generate(null, null, `Toutes les personnes ont correctement été retirées du service !`, `#0DE600`, null, null, `Gestion du service`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).icon}.webp`, null, null, null, true)], ephemeral: true });
        // Supprime la réponse après 5s
        await wait(5000);
        await interaction.deleteReply();
    },
};