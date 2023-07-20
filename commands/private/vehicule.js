//Récupération des fonctions pour créer une commande et un modal
const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
//Récup du logger
const logger = require('../../modules/logger');
//Récup du créateur d'embed
const emb = require('../../modules/embeds');
//Récup des requêtes SQL pour les véhicules
const vehicles = require('../../sql/objectsManagement/vehicule');
//Fonction pour attendre
const wait = require('node:timers/promises').setTimeout;
//Récup des autorisations
const { Rank, hasAuthorization } = require('../../modules/rankAuthorization');

module.exports = {
    //Création de la commande
    data: new SlashCommandBuilder()
        .setName(`vehicule`)
        .setDescription(`Gestion des véhicules`)
        .addStringOption(option => 
            option.setName(`action`)
            .setDescription(`Selectionnez ce que vous voulez faire`)
            .addChoices(
                {
                    name: `Ajouter`,
                    value: `add`
                },
                {
                    name: `Supprimer`,
                    value: `remove`
                }
            )
            .setRequired(true)
        ),
    async execute(interaction) {
        if(hasAuthorization(Rank.DepartementManager, interaction.member.roles.cache)) {
            const vehicules = await vehicles.get();
            if (interaction.options.getString(`action`) === `add`) {
                const vehiculeAddModal = new ModalBuilder().setCustomId(`vehiculeAddModal`).setTitle(`Ajouter un véhicule`);
                const nom = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId(`nom`).setLabel(`Nom du véhicule`).setStyle(TextInputStyle.Short).setPlaceholder(`Ex: Lulucoptère`).setRequired(true));
                const plaque = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId(`plaque`).setLabel(`Plaque d'immatriculation`).setStyle(TextInputStyle.Short).setPlaceholder(`Ex: LSMS 874`).setRequired(true));
                const ct = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId(`ct`).setLabel(`Date du contrôle technique`).setStyle(TextInputStyle.Short).setPlaceholder("Ex: 01/07/2023").setRequired(true));
                const type = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId(`type`).setLabel(`Type du véhicule`).setStyle(TextInputStyle.Short).setPlaceholder("Ex: polmav").setRequired(true));
                vehiculeAddModal.addComponents(nom, plaque, ct, type);
                await interaction.showModal(vehiculeAddModal);
            } else if(interaction.options.getString(`action`) === `remove`) {
                const vehiculeRemoveSelect = new StringSelectMenuBuilder().setCustomId(`vehiculeRemoveSelect`).setPlaceholder(`Choisissez le(s) véhicule(s) à supprimer`).setMinValues(1);
                //Ajout des opérations possibles
                if(vehicules[0] == null) {
                    interaction.reply({ embeds: [emb.generate(null, null, `Désolé :(\nIl semblerait que la liste des véhicules soit vide pour le moment !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, `Gestion des véhicules`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).icon}.webp`, null, null, null, false)], ephemeral: true });
                    await wait(5000);
                    await interaction.deleteReply();
                } else {
                    //Affichage du message "Iris réfléchis..."
                    await interaction.deferReply({ ephemeral: true });
                    for(i=0;i<vehicules.length;i++) {
                        vehiculeRemoveSelect.addOptions(new StringSelectMenuOptionBuilder().setLabel(`${vehicules[i].name}`).setValue(`${vehicules[i].plate}`));
                    }
                    vehiculeRemoveSelect.setMaxValues(vehicules.length);
                    const allOptions = new ActionRowBuilder().addComponents(vehiculeRemoveSelect);
                    await interaction.followUp({ components: [allOptions], ephemeral: true });
                }
            }
        } else {
            await interaction.reply({ embeds: [emb.generate(`Désolé :(`, null, `Vous n'avez pas les permissions suffisantes pour utiliser cette commande. Il faut être <@&${process.env.IRIS_DEPARTEMENT_MANAGER_ROLE}> ou plus pour pouvoir vous en servir !`, "#FF0000", process.env.LSMS_LOGO_V2, null, `Gestion des véhicules`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).icon}.webp`, null, null, null, false)], ephemeral: true });
            await wait(5000);
            await interaction.deleteReply();
        }
    },
};