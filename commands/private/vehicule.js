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
//Récup du régénérateur de véhicules
const regenVeh = require('../../modules/regenVehicles');

const security = require('../../modules/service');

let reply;

module.exports = {
    //Création de la commande
    data: new SlashCommandBuilder()
        .setName(`vehicule`)
        .setDescription(`Gestion des véhicules`)
        .addStringOption(option => 
            option.setName(`action`)
            .setDescription(`Sélectionnez ce que vous voulez faire`)
            .addChoices(
                {
                    name: `Ajouter`,
                    value: `add`
                },
                {
                    name: `Régénérer`,
                    value: `regen`
                },
                {
                    name: `Supprimer`,
                    value: `remove`
                }
            )
            .setRequired(true)
        ),
    async execute(interaction) {
        if(interaction.commandName == 'vehicule') {
            const vehicules = await vehicles.get();
            if (interaction.options.getString(`action`) === `add`) {
                if(hasAuthorization(Rank.DepartementManager, interaction.member.roles.cache)) {
                    const vehiculeAddModal = new ModalBuilder().setCustomId(`vehiculeAddModal`).setTitle(`Ajouter un véhicule`);
                    const nom = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId(`nom`).setLabel(`Nom du véhicule`).setStyle(TextInputStyle.Short).setPlaceholder(`Ex: SUV 1`).setRequired(true));
                    const plaque = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId(`plaque`).setLabel(`Plaque d'immatriculation`).setStyle(TextInputStyle.Short).setPlaceholder(`Ex: LSMS 830`).setRequired(true));
                    const ct = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId(`ct`).setLabel(`Date du contrôle technique`).setStyle(TextInputStyle.Short).setPlaceholder("Ex: JJ/MM/AAAA").setRequired(true));
                    const type = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId(`type`).setLabel(`Type du véhicule`).setStyle(TextInputStyle.Short).setPlaceholder("Ex: fbi2").setRequired(true));
                    vehiculeAddModal.addComponents(nom, plaque, ct, type);
                    await interaction.showModal(vehiculeAddModal);
                } else {
                    await interaction.reply({ embeds: [emb.generate(`Désolé :(`, null, `Vous n'avez pas les permissions suffisantes pour utiliser cette commande. Il faut être <@&${process.env.IRIS_DEPARTEMENT_MANAGER_ROLE}> ou plus pour pouvoir vous en servir !`, "#FF0000", process.env.LSMS_LOGO_V2, null, `Gestion des véhicules`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });
                    await wait(5000);
                    await interaction.deleteReply();
                }
            } else if(interaction.options.getString(`action`) === `regen`) {
                if(!security.isGen()) {
                    //Affichage du message "Iris réfléchis..."
                    await interaction.deferReply({ ephemeral: true });
                    const allVeh = await vehicles.get();
                    const vehChanId = await vehicles.getChannelId();
                    if(vehChanId[0] == null) {
                        return interaction.followUp({ embeds: [emb.generate(`Oups :(`, null, `Aucun salon de gestion des véhicules n'a été trouvé en base de donnée\nVeuillez contacter un de mes développeurs (<@461880599594926080>, <@461807010086780930> ou <@368259650136571904>) pour régler ce problème !`, "#FF0000", process.env.LSMS_LOGO_V2, null, `Gestion des véhicules`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });
                    }
                    let vehiculeChannelID = vehChanId[0].id;
                    const channelToSend = await interaction.guild.channels.cache.get(vehiculeChannelID);
                    security.setGen(true);
                    await regenVeh.all(channelToSend, allVeh);
                    security.setGen(false);
                    await interaction.followUp({ embeds: [emb.generate(null, null, `La liste des véhicules a bien été régénérée !`, "#0DE600", process.env.LSMS_LOGO_V2, null, `Gestion des véhicules`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });
                    await wait(5000);
                    await interaction.deleteReply();
                } else {
                    await interaction.reply({ embeds: [emb.generate(`Désolé :(`, null, `Désolé il y a déjà quelque chose en cours de génération, pour éviter tout problème veuillez patienter quelques instants puis réessayez !`, "#FF0000", process.env.LSMS_LOGO_V2, null, `Gestion des véhicules`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });
                    await wait(5000);
                    await interaction.deleteReply();
                }
            } else if(interaction.options.getString(`action`) === `remove`) {
                if(hasAuthorization(Rank.DepartementManager, interaction.member.roles.cache)) {
                    reply = null;
                    const vehiculeRemoveSelect = new StringSelectMenuBuilder().setCustomId(`vehiculeRemoveSelect`).setPlaceholder(`Choisissez le(s) véhicule(s) à supprimer`).setMinValues(1);
                    //Ajout des opérations possibles
                    if(vehicules[0] == null) {
                        interaction.reply({ embeds: [emb.generate(null, null, `Désolé :(\nIl semblerait que la liste des véhicules soit vide pour le moment !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, `Gestion des véhicules`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });
                        await wait(5000);
                        await interaction.deleteReply();
                    } else {
                        //Affichage du message "Iris réfléchis..."
                        reply = await interaction.deferReply({ ephemeral: true });
                        for(i=0;i<vehicules.length;i++) {
                            vehiculeRemoveSelect.addOptions(new StringSelectMenuOptionBuilder().setLabel(`${vehicules[i].name}`).setValue(`${vehicules[i].plate}`));
                        }
                        vehiculeRemoveSelect.setMaxValues(vehicules.length);
                        const allOptions = new ActionRowBuilder().addComponents(vehiculeRemoveSelect);
                        await interaction.followUp({ components: [allOptions], ephemeral: true });
                    }
                } else {
                    await interaction.reply({ embeds: [emb.generate(`Désolé :(`, null, `Vous n'avez pas les permissions suffisantes pour utiliser cette commande. Il faut être <@&${process.env.IRIS_DEPARTEMENT_MANAGER_ROLE}> ou plus pour pouvoir vous en servir !`, "#FF0000", process.env.LSMS_LOGO_V2, null, `Gestion des véhicules`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });
                    await wait(5000);
                    await interaction.deleteReply();
                }
            }
        } else if(interaction.customId == 'vehiculeRemoveSelect') {
            if(!security.isGen()) {
                let respContent = 'Le(s) véhicule(s) immatriculé(s) ';
                let isVehNull = false;
                for(i=0;i<interaction.values.length;i++) {
                    const vehicules = await vehicles.getByPlate(interaction.values[i]);
                    if(vehicules[0] != null) {
                        await vehicles.delete(vehicules[0].plate);
                        if(i == 0) {
                            respContent = respContent + `**${vehicules[0].plate}**`
                        } else if(i != interaction.values.length - 1) {
                            respContent = respContent + `, **${vehicules[0].plate}**`
                        } else {
                            respContent = respContent + ` et **${vehicules[0].plate}**`
                        }
                    } else {
                        isVehNull = true;
                    }
                }
                //Send confirmation message
                if(!isVehNull) {
                    const allVehicles = await vehicles.get();
                    //Récupération du channel des véhicules
                    const vehChanId = await vehicles.getChannelId();
                    try {
                        if(vehChanId[0] == null) {
                            return reply.edit({ embeds: [emb.generate(`Oups :(`, null, `Aucun salon de gestion des véhicules n'a été trouvé en base de donnée\nVeuillez contacter un des développeurs (<@461880599594926080>, <@461807010086780930> ou <@368259650136571904>) pour régler ce problème !`, "#FF0000", process.env.LSMS_LOGO_V2, null, `Gestion des véhicules`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], components: [], ephemeral: true });
                        }
                        await reply.edit({ embeds: [emb.generate(null, null, `<a:loading:1140500830672392283> Mise à jour en cours...`, `Gold`, process.env.LSMS_LOGO_V2, null, `Gestion des véhicules`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], components: [], ephemeral: true });
                        let vehiculeChannelID = vehChanId[0].id;
                        const vehChan = await interaction.guild.channels.cache.get(vehiculeChannelID);
                        security.setGen(true);
                        await regenVeh.all(vehChan, allVehicles);
                        security.setGen(false);
                        await reply.edit({ embeds: [emb.generate(null, null, `${respContent} a/ont bien été retiré(s) de la liste !`, `#0DE600`, process.env.LSMS_LOGO_V2, null, `Gestion des véhicules`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], components: [], ephemeral: true });
                        // Supprime la réponse après 5s
                        await wait(5000);
                        await reply.delete();
                    } catch (err) {
                        logger.error(err);
                        if(vehChanId[0] == null) {
                            return interaction.reply({ embeds: [emb.generate(`Oups :(`, null, `Aucun salon de gestion des véhicules n'a été trouvé en base de donnée\nVeuillez contacter un des développeurs (<@461880599594926080>, <@461807010086780930> ou <@368259650136571904>) pour régler ce problème !`, "#FF0000", process.env.LSMS_LOGO_V2, null, `Gestion des véhicules`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], components: [], ephemeral: true });
                        }
                        interaction.deferUpdate();
                        let vehiculeChannelID = vehChanId[0].id;
                        const vehChan = await interaction.guild.channels.cache.get(vehiculeChannelID);
                        security.setGen(true);
                        await regenVeh.all(vehChan, allVehicles);
                        security.setGen(false);
                        await interaction.reply({ embeds: [emb.generate(null, null, `${respContent} a/ont bien été retiré(s) de la liste !`, `#0DE600`, process.env.LSMS_LOGO_V2, null, `Gestion des véhicules`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });
                        // Supprime la réponse après 5s
                        await wait(5000);
                        await interaction.deleteReply();
                    }
                } else {
                    try {
                        await reply.edit({ embeds: [emb.generate(null, null, `⚠️ Attention, il n'y a plus aucun véhicule encore présent dans cette liste à supprimer\nSi jamais il en reste encore veuillez refaire la commande !`, `Gold`, process.env.LSMS_LOGO_V2, null, `Gestion des véhicules`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], components: [], ephemeral: true });
                    } catch (err) {
                        logger.error(err);
                        await interaction.reply({ embeds: [emb.generate(null, null, `⚠️ Attention, il n'y a plus aucun véhicule encore présent dans cette liste à supprimer\nSi jamais il en reste encore veuillez refaire la commande !`, `Gold`, process.env.LSMS_LOGO_V2, null, `Gestion des véhicules`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });
                    }
                }
            } else {
                try {
                    await reply.edit({ embeds: [emb.generate(`Désolé :(`, null, `Désolé il y a déjà quelque chose en cours de génération, pour éviter tout problème veuillez patienter quelques instants puis réessayez !`, "#FF0000", process.env.LSMS_LOGO_V2, null, `Gestion des véhicules`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], components: [], ephemeral: true });
                    await wait(5000);
                    await reply.delete();
                } catch (err) {
                    logger.error(err);
                    await interaction.reply({ embeds: [emb.generate(`Désolé :(`, null, `Désolé il y a déjà quelque chose en cours de génération, pour éviter tout problème veuillez patienter quelques instants puis réessayez !`, "#FF0000", process.env.LSMS_LOGO_V2, null, `Gestion des véhicules`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], components: [], ephemeral: true });
                    await wait(5000);
                    await interaction.deleteReply();
                }
            }
        }
    },
};