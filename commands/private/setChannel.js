//Récupération des fonctions pour créer une commande et un modal
const { SlashCommandBuilder, ChannelType } = require('discord.js');
//Récup du logger
const logger = require('../../modules/logger');
//Récup du SQL pour les channels
const sql = require('../../sql/config/config');
//Récup du créateur d'embed
const emb = require('../../modules/embeds');
//Récup des autorisations
const { Rank, hasAuthorization } = require('../../modules/rankAuthorization');
const agenda = require('./agenda');
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
                    value: 'follow'
                },
                {
                    name: 'Salon de l\'agenda',
                    value: 'agenda'
                },
                {
                    name: 'Salon des décès (Mairie)',
                    value: 'mairie_décès'
                },
                {
                    name: 'Salon des décès (LSPD)',
                    value: 'lspd'
                },
                {
                    name: 'Salon de la liste des véhicules',
                    value: 'vehicule'
                }
            )
            .setRequired(true)
        )
        .addChannelOption( option =>
            option.setName('salon')
            .setDescription('Nouveau salon à assigner')
            .addChannelTypes(ChannelType.AnnouncementThread, ChannelType.GuildAnnouncement, ChannelType.GuildText, ChannelType.GuildVoice, ChannelType.PrivateThread, ChannelType.PublicThread)
            .setRequired(true)
        ),
    async execute(interaction) {
        //Vérification de l'autorisation si il est directeur ou si il est le créateur du bot
        if(hasAuthorization(interaction.member, Rank.MANAGER) || interaction.user.id == '461880599594926080' || interaction.user.id == '461807010086780930' || interaction.user.id == '368259650136571904') {
            //Récupération des infos
            const channelID = interaction.options.getChannel('salon').id;
            const channelName = interaction.options.getString('channel_name');
            //Vérification si le channel existe
            const channel = interaction.guild.channels.cache.get(channelID);
            if(channel) {
                //Changement du channel
                exist = await sql.checkIfExist(interaction.options.getString('action'));
                if(exist) {
                    await sql.updateChannel(interaction.options.getString('action'), channelID);
                } else {
                    await sql.setChannel(interaction.options.getString('action'), channelID);
                }
                //Création de l'embed
                const embed = emb.generate(null, null, `Le channel a bien été mis à jour !`, `#0DE600`, process.env.LSMS_LOGO_V2, null, `Gestion du service`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, true);
                //Envoi de la réponse
                interaction.reply({ embeds: [embed], ephemeral: true });
            } else {
                //Création de l'embed
                const embed = emb.generate(null, null, `Le channel n'existe pas !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, `Gestion du service`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, true);
                //Envoi de la réponse
                interaction.reply({ embeds: [embed], ephemeral: true });
            }
        } else {
            //Création de l'embed
            const embed = emb.generate(null, null, `Vous n'avez pas la permission d'utiliser cette commande !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, `Gestion du service`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, true);
            //Envoi de la réponse
            interaction.reply({ embeds: [embed], ephemeral: true });
        }
        await wait(5000);
        await interaction.deleteReply();
    }
}