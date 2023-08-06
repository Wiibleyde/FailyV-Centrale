//Récupération des fonctions pour créer une liste
const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
//Récup du logger
const logger = require('../../modules/logger');
//Récup du créateur d'embed
const emb = require('../../modules/embeds');
//Fonction pour attendre
const wait = require('node:timers/promises').setTimeout;

const sqlFollow = require('../../sql/suivi/suivi');
const sqlFollowSecours = require('../../sql/suivi/secours');

const format = require('../../modules/formatName');

const security = require('../../modules/service');

const suivi = require('../../modules/suiviMessages');

let reply;

module.exports = {
    execute: async function(interaction, errEmb) {
        if(interaction.customId == 'followUpdateSecoursPatient') {
            reply = null;
            const chan = await sqlFollow.getFollowChannelId();
            if(chan[0] == null) {
                await interaction.reply({ embeds: [emb.generate(`Oups :(`, null, `❗ Attention, aucun salon de suivi n'a été trouvé en base de donnée\nVeuillez contacter un des développeurs (<@461880599594926080>, <@461807010086780930> ou <@368259650136571904>) pour régler ce problème !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, `Gestion des Premiers Secours`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });
                // Supprime la réponse après 5s
                await wait(5000);
                return await interaction.deleteReply();
            }
    
            if(security.isGen()) {
                await interaction.reply({ embeds: [emb.generate(`Oups :(`, null, `Désolé il y a déjà quelque chose en cours de génération, pour éviter tout problème veuillez patienter quelques instants puis réessayez !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, `Gestion des Premiers Secours`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });
                // Supprime la réponse après 5s
                await wait(5000);
                return await interaction.deleteReply();
            }
    
            //Création d'une liste d'opération possible
            let options = new StringSelectMenuBuilder().setCustomId('followUpdateSecoursPatientSelect').setPlaceholder('Choisissez la/les personne(s) que vous souhaitez mettre à jour').setMinValues(1);
            //Ajout des opérations possibles
            let totalPatient = 0;
            const patients = await sqlFollowSecours.getAllPatientToValidate();
            for(i=0;i<patients.length;i++) {
                let name = format.name(patients[i].name);
                options.addOptions(new StringSelectMenuOptionBuilder().setLabel(`${name}`).setValue(patients[i].id.toString()));
                totalPatient++;
            }
            options.setMaxValues(totalPatient);
            if(totalPatient != 0) {
                const allOptions = new ActionRowBuilder().addComponents(options);
                try {
                    //Confirmation à Discord du succès de l'opération
                    security.setGen(true);
                    reply = await interaction.reply({ components: [allOptions], ephemeral: true });
                } catch (err) {
                    logger.error(err);
                    //Confirmation à Discord du succès de l'opération
                    await interaction.reply({ embeds: [errEmb], ephemeral: true });
                }
            } else {
                await interaction.reply({ embeds: [emb.generate(`Oups :(`, null, `Il semblerait qu'il n'y ait aucune personne à mettre à jour dans cette liste !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, `Gestion des Premiers Secours`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });
                // Supprime la réponse après 5s
                await wait(5000);
                await interaction.deleteReply();
            }
        } else if(interaction.customId == 'followUpdateSecoursPatientSelect') {
            try {
                await reply.edit({ embeds: [emb.generate(null, null, `<a:loading:1137771560531398697> Mise à jour en cours...`, `Gold`, process.env.LSMS_LOGO_V2, null, `Gestion des Premiers Secours`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], components: [], ephemeral: true });
            } catch (err) {
                await interaction.deferReply({ ephemeral: true });
            }
            let respContent = 'Le status de ';
            let isPatientNull = false;
            for(i=0;i<interaction.values.length;i++) {
                const patient = await sqlFollowSecours.getById(interaction.values[i]);
                if(patient[0] != null) {
                    let name = format.name(patient[0].name);
                    await sqlFollowSecours.update(interaction.values[i], 1);
                    if(i == 0) {
                        respContent = respContent + `**${name}**`
                    } else if(i != interaction.values.length - 1) {
                        respContent = respContent + `, **${name}**`
                    } else {
                        respContent = respContent + ` et **${name}**`
                    }
                } else {
                    isPatientNull = true;
                }
            }
            //Send confirmation message
            if(!isPatientNull) {
                //Récupération du channel des véhicules
                const followChannel = await sqlFollow.getFollowChannelId();
                try {
                    if(followChannel[0] == null) {
                        return reply.edit({ embeds: [emb.generate(null, null, `⚠️ Attention, aucun salon de suivi n'a été trouvé en base de donnée\nVeuillez contacter un des développeurs (<@461880599594926080>, <@461807010086780930> ou <@368259650136571904>) pour régler ce problème !`, 'Gold', process.env.LSMS_LOGO_V2, null, `Gestion des Premiers Secours`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], components: [], ephemeral: true });
                    }
                    security.setGen(true);
                    await suivi.regen(interaction.client);
                    security.setGen(false);
                    await reply.edit({ embeds: [emb.generate(null, null, `${respContent} a bien été mis à jour !`, `#0DE600`, process.env.LSMS_LOGO_V2, null, `Gestion des Premiers Secours`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], components: [], ephemeral: true });
                    // Supprime la réponse après 5s
                    await wait(5000);
                    await reply.delete();
                } catch (err) {
                    logger.error(err);
                    if(followChannel[0] == null) {
                        return interaction.followUp({ embeds: [emb.generate(null, null, `⚠️ Attention, aucun salon de suivi n'a été trouvé en base de donnée\nVeuillez contacter un des développeurs (<@461880599594926080>, <@461807010086780930> ou <@368259650136571904>) pour régler ce problème !`, 'Gold', process.env.LSMS_LOGO_V2, null, `Gestion des Premiers Secours`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });
                    }
                    security.setGen(true);
                    await suivi.regen(interaction.client);
                    security.setGen(false);
                    await interaction.followUp({ embeds: [emb.generate(null, null, `${respContent} a bien été mis à jour !`, `#0DE600`, process.env.LSMS_LOGO_V2, null, `Gestion des Premiers Secours`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });
                    // Supprime la réponse après 5s
                    await wait(5000);
                    await interaction.deleteReply();
                }
            } else {
                try {
                    await reply.edit({ embeds: [emb.generate(null, null, `⚠️ Attention, il n'y a plus aucune personne encore présente dans cette liste à supprimer\nSi jamais il en reste encore veuillez réutiliser le bouton !`, `Gold`, process.env.LSMS_LOGO_V2, null, `Gestion des Premiers Secours`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], components: [], ephemeral: true });
                } catch (err) {
                    logger.error(err);
                    await interaction.followUp({ embeds: [emb.generate(null, null, `⚠️ Attention, il n'y a plus aucune personne encore présente dans cette liste à supprimer\nSi jamais il en reste encore veuillez réutiliser le bouton !`, `Gold`, process.env.LSMS_LOGO_V2, null, `Gestion des Premiers Secours`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });
                }
            }
        }
    }
}