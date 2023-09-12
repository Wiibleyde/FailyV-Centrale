// Récupération des fonctions pour créer une commande
const { SlashCommandBuilder } = require('discord.js');
// Récupération du logger
const logger = require('../../modules/logger');
// Récupération du créateur d'embed
const emb = require('../../modules/embeds');
//Récup du systeme de logs RP
const logRP = require('../../modules/logsRP');
//Récup des requêtes SQL de debug
const debugSQL = require('../../sql/debugMode/debugMode');
//Fonction pour attendre
const wait = require('node:timers/promises').setTimeout;
//Récup du service de kick
const service = require('../../modules/kickservice');

const blackout = require('../../modules/blackout');
const config = require('../../sql/config/config');
const rolesCreator = require('../../modules/rolesCreator');

module.exports = {
    // Création de la commande
    data: new SlashCommandBuilder()
        .setName('fds')
        .setDescription('Commande de backup 🙃'),
    async execute(interaction) {
        const title = `Fin de service`;
        const client = interaction.client;
        const guild = client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID);
        const serverIcon = `https://cdn.discordapp.com/icons/${interaction.guild.id}/${interaction.guild.icon}.webp`;
        if(interaction.user.id != '461880599594926080' && interaction.user.id != '461807010086780930' && interaction.user.id != '368259650136571904') {
            await interaction.reply({ embeds: [emb.generate(`Désolé :(`, null, `Cette commande est réservé à mes développeurs (<@461880599594926080>, <@461807010086780930> et <@368259650136571904>) !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, true)], ephemeral: true });
            await wait(5000);
            return await interaction.deleteReply();
        }
        const botMember = 'Chantrale';
        await logRP.fds(guild, botMember, null);
        await interaction.reply({ embeds: [emb.generate(`BACKUP`, null, `Annonce de fin de service réussie, à bientôt je l'espère 💙`, `#0DE600`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, true)], ephemeral: true });
        await wait(5000);
        await interaction.deleteReply();
    },
};
