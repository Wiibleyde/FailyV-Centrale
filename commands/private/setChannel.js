//Récupération des fonctions pour créer une commande et un modal
const { SlashCommandBuilder } = require('discord.js');
//Récup du logger
const logger = require('../../modules/logger');
//Récup du SQL pour les channels
const sql = require('../../sql/config/config');
//Récup du créateur d'embed
const emb = require('../../modules/embeds');
//Récup des autorisations
const { Rank, hasAuthorization } = require('../../modules/rankAuthorization');
//Fonction pour attendre
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    //Création de la commande
    data: new SlashCommandBuilder()
        .setName(`set_channel`)
        .setDescription(`[Direction] Changer le'id d'un channel`)
        .addStringOption(option =>
            option.setName('action')
            .setDescription('Channel à modifier')
            .addChoices(
                {
                    name: 'Gestion du service',
                    value: 'IRIS_SERVICE_CHANNEL_ID'
                },
                {
                    name: 'Gestion des radios',
                    value: 'IRIS_RADIO_CHANNEL_ID'
                },
                {
                    name: 'Salon des annonces',
                    value: 'IRIS_ANNOUNCEMENT_CHANNEL_ID'
                },
                {
                    name: 'Salon de l\'effectif',
                    value: 'IRIS_WORKFORCE_CHANNEL_ID'
                },
                {
                    name: 'Salon de l\'effectif des véhicules',
                    value: 'IRIS_VEHICLES_CHANNEL_ID'
                },
                {
                    name: 'Salon des rdv psychologiques',
                    value: 'IRIS_PSYCHO_CHANNEL_ID'
                },
                {
                    name: 'Salon des rdv chirurgicaux',
                    value: 'IRIS_SURGERY_CHANNEL_ID'
                },
                {
                    name: 'Salon des rdv généraux',
                    value: 'IRIS_GENERAL_CHANNEL_ID'
                },
                {
                    name: 'Salon des suivis',
                    value: 'IRIS_FOLLOW_CHANNEL_ID'
                }
            ),
        )
        .addStringOption( option =>
            option.setName('id')
            .setDescription('ID du channel')
            .setRequired(true)
            .setMinLength(18)
            .setMaxLength(18)
            .setRequired(true)
        ),
    async execute(interaction) {
        //Vérification de l'autorisation si il est directeur ou si il est le créateur du bot
        if(hasAuthorization(interaction.member, Rank.MANAGER) || interaction.user.id == '461880599594926080' || interaction.user.id == '461807010086780930' || interaction.user.id == '368259650136571904') {
            //Récupération des infos
            const channelID = interaction.options.getString('channel');
            const channelName = interaction.options.getString('channel_name');
            //Vérification si le channel existe
            const channel = interaction.guild.channels.cache.get(channelID);
            if(channel) {
                //Changement du channel
                sql.setChannel(channelName, channelID);
                //Envoi de l'embed
                interaction.reply({ embeds: [emb.successEmb(interaction, `Le channel ${channelName} a bien été changé !`)] });
            } else {
                //Envoi de l'embed
                interaction.reply({ embeds: [emb.errorEmb(interaction, `Le channel ${channelName} n'existe pas !`)] });
            }
        } else {
            //Envoi de l'embed
            interaction.reply({ embeds: [emb.errorEmb(interaction, `Vous n'avez pas l'autorisation d'utiliser cette commande !`)] });
        }
        await wait(5000);
        await interaction.deleteReply();
    }
}