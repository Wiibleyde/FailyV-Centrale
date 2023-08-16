//Récupération des fonctions pour créer une commande et un modal
const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
//Récup du logger
const logger = require('../../modules/logger');
//Récup du SQL pour les channels
const sql = require('../../sql/config/config');
//Récup du créateur d'embed
const emb = require('../../modules/embeds');
//Récup des autorisations
const { Rank, hasAuthorization } = require('../../modules/rankAuthorization');
//Récupération de l'agenda
const agenda = require('./agenda');
//Fonction pour attendre
const wait = require('node:timers/promises').setTimeout;
//Récupération du nom du bot
const sqlNickname = require('../../sql/rename/rename');

module.exports = {
    //Création de la commande
    data: new SlashCommandBuilder()
        .setName(`define`)
        .setDescription(`[Direction] Définir un nouveau salon pour la fonction sélectionnée`)
        .addStringOption(option =>
            option.setName('channel')
            .setDescription('Channel à modifier')
            .addChoices(
                {
                    name: 'Gestion du service',
                    value: 'IRIS_SERVICE_CHANNEL_ID'
                },
                {
                    name: 'Centrale',
                    value: 'IRIS_RADIO_CHANNEL_ID'
                },
                {
                    name: 'Effectif',
                    value: 'IRIS_WORKFORCE_CHANNEL_ID'
                },
                {
                    name: 'Liste des véhicules',
                    value: 'vehicule'
                },
                {
                    name: 'Annonces',
                    value: 'IRIS_ANNOUNCEMENT_CHANNEL_ID'
                },
                {
                    name: 'Délégué du personnel',
                    value: 'staff_representative'
                },
                {
                    name: 'Agenda',
                    value: 'agenda'
                },
                {
                    name: 'Rendez-vous généraux',
                    value: 'IRIS_GENERAL_CHANNEL_ID'
                },
                {
                    name: 'Rendez-vous chirurgicaux',
                    value: 'IRIS_SURGERY_CHANNEL_ID'
                },
                {
                    name: 'Rendez-vous psychologiques',
                    value: 'IRIS_PSYCHO_CHANNEL_ID'
                },
                {
                    name: 'Suivis',
                    value: 'follow'
                },
                {
                    name: 'Annonce des décès à la Mairie',
                    value: 'mairie_décès'
                },
                {
                    name: 'Annonce des décès au LSPD',
                    value: 'lspd'
                },
                {
                    name: 'BCMS',
                    value: 'bcms_channel_id'
                },
                {
                    name: 'Mises à jour de la Centrale',
                    value: 'IRIS_PATCHNOTE_CHANNEL_ID'
                }
            )
            .setRequired(true)
        ).addChannelOption( option =>
            option.setName('salon')
            .setDescription('Nouveau salon à assigner')
            .addChannelTypes(ChannelType.AnnouncementThread, ChannelType.GuildAnnouncement, ChannelType.GuildText, ChannelType.GuildVoice, ChannelType.PrivateThread, ChannelType.PublicThread)
            .setRequired(true)
        ).setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    async execute(interaction) {
        const serverIcon = `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`;
        const title = `Gestion des salons`;
        //Vérification de l'autorisation si il est directeur ou si il est le créateur du bot
        if(hasAuthorization(Rank.DepartementManager, interaction.member.roles.cache) || interaction.user.id == '461880599594926080' || interaction.user.id == '461807010086780930' || interaction.user.id == '368259650136571904') {
            await interaction.deferReply({ ephemeral: true });
            //Récupération des infos
            const channelID = interaction.options.getChannel('salon').id;
            //Vérification si le channel existe
            const channel = interaction.guild.channels.cache.get(channelID);
            if(channel) {
                //Changement du channel
                exist = await sql.checkIfExist(interaction.options.getString('channel'));
                if(exist) {
                    await sql.updateChannel(interaction.options.getString('channel'), channelID);
                } else {
                    await sql.setChannel(interaction.options.getString('channel'), channelID);
                }
                //Création de l'embed
                const embed = emb.generate(null, null, `Le salon a bien été mis à jour !`, `#0DE600`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, true);
                //Envoi de la réponse
                await interaction.followUp({ embeds: [embed], ephemeral: true });
            } else {
                //Création de l'embed
                const embed = emb.generate(null, null, `Le salon n'existe pas !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, true);
                //Envoi de la réponse
                await interaction.followUp({ embeds: [embed], ephemeral: true });
            }
        } else {
            const embed = emb.generate(`Désolé :(`, null, `Vous n'avez pas les permissions suffisantes pour utiliser cette commande. Il faut être <@&${process.env.IRIS_DEPARTEMENT_MANAGER_ROLE}> ou plus pour pouvoir vous en servir !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, false);
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
        await wait(5000);
        await interaction.deleteReply();
    }
}