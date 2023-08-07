//Récupération des fonctions pour créer une commande
const { SlashCommandBuilder } = require('discord.js');
//Récup du logger
const logger = require('../../modules/logger');
//Récup du créateur d'embed
const emb = require('../../modules/embeds');
//Fonction pour attendre
const wait = require('node:timers/promises').setTimeout;
//Récup des requêtes SQL de debug
const debugSQL = require('../../sql/debugMode/debugMode');

const rolesCreator = require('../../modules/rolesCreator');

module.exports = {
    //Création de la commande
    data: new SlashCommandBuilder()
        .setName('debug')
        .setDescription('[DEV ONLY] Activer/Désactiver le mode debug'),
    async execute(interaction) {
        if(interaction.user.id == '461880599594926080' || interaction.user.id == '461807010086780930' || interaction.user.id == '368259650136571904') {
            //Affichage du message "Iris réfléchis..."
            await interaction.deferReply({ ephemeral: true });
            const guild = await interaction.client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID);
            let alreadyEnabled = await debugSQL.getDebugState();
            alreadyEnabled = alreadyEnabled[0].state;
            const roleID = await debugSQL.getDebugRole();
            let debugRole = guild.roles.cache.get(roleID[0].roleID);
            if(debugRole == undefined) {
                debugRole = await rolesCreator.createDebugRole(interaction.client);
            }
            let text = '';
            let color = '';
            if(alreadyEnabled == '0') {
                guild.members.cache.get(interaction.user.id).roles.add(debugRole);
                debugSQL.setDebugState('1');
                text = 'Mode debug activé !';
                color = '#0DE600';
            } else {
                let numInRole = 0;
                debugRole.members.map(m => numInRole++);
                if(!guild.members.cache.get(interaction.user.id).roles.cache.has(roleID[0].roleID)) {
                    guild.members.cache.get(interaction.user.id).roles.add(debugRole);
                    text = 'Mode debug activé !';
                    color = '#0DE600';
                } else {
                    if(numInRole <= 1) {
                        debugSQL.setDebugState('0');
                    }
                    guild.members.cache.get(interaction.user.id).roles.remove(debugRole);
                    text = 'Mode debug désactivé !';
                    color = '#FF0000';
                }
            }
            interaction.followUp({ embeds: [emb.generate(null, null, text, color, process.env.LSMS_LOGO_V2, null, `DEBUG MODE`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${guild.icon}.webp`, null, null, null, true)], ephemeral: true })
        } else {
            interaction.reply({ embeds: [emb.generate(null, null, `Désolé :(\n\nCette commande est réservé à mes développeurs (<@461880599594926080>, <@461807010086780930> et <@368259650136571904>) au cas où j'aurais un soucis !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, `DEBUG MODE`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${guild.icon}.webp`, null, null, null, true)], ephemeral: true });
        }
    }
};