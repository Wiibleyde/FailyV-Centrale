//Récupération des fonctions pour créer une liste
const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
//Récup du logger
const logger = require('../../modules/logger');
//Récup du créateur d'embed
const emb = require('../../modules/embeds');
//Fichier de service pour reset
const service = require('../../modules/service');

const wait = require('node:timers/promises').setTimeout;

let reply;

module.exports = {
    execute: async function(interaction, errEmb) {
        if(interaction.customId == 'serviceRadioReset') {
            if(!service.isGen()) {
                reply = null;
                //Création d'une liste d'opération possible
                const options = new StringSelectMenuBuilder().setCustomId('centraleResetRadioSelect').setPlaceholder('Choisissez la/les radio(s) à retirer').setMinValues(1).setMaxValues(2);
                //Ajout des opérations possibles
                options.addOptions(new StringSelectMenuOptionBuilder().setLabel(`BCMS`).setValue(`BCMS`).setEmoji('1124910870695256106'));
                options.addOptions(new StringSelectMenuOptionBuilder().setLabel(`Event`).setValue(`évènementielle`).setEmoji('1121278617960329257'));
                const allOptions = new ActionRowBuilder().addComponents(options);
                try {
                    //Confirmation à Discord du succès de l'opération
                    reply = await interaction.reply({ components: [allOptions], ephemeral: true });
                } catch (err) {
                    logger.error(err);
                    //Confirmation à Discord du succès de l'opération
                    await interaction.reply({ embeds: [errEmb], ephemeral: true });
                }
                //Reset des radios
            } else {
                await interaction.reply({ embeds: [emb.generate(`Désolé :(`, null, `Désolé il y a déjà quelque chose en cours de génération, pour éviter tout problème veuillez patienter quelques instants puis réessayez !`, "#FF0000", process.env.LSMS_LOGO_V2, null, `Gestion des véhicules`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });
                await wait(5000);
                await interaction.deleteReply();
            }
        } else if(interaction.customId == 'centraleResetRadioSelect') {
            if(!service.isGen()) {
                //Confirmation à Discord du succès de l'opération
                let radiosToReset = [];
                let respContent = 'La/les radio(s) ';
                for(i=0;i<interaction.values.length;i++) {
                    if(i == 0) {
                        respContent = respContent + `**${interaction.values[i]}**`
                    } else if(i != interaction.values.length - 1) {
                        respContent = respContent + `, **${interaction.values[i]}**`
                    } else {
                        respContent = respContent + ` et **${interaction.values[i]}**`
                    }
                    radiosToReset.push(interaction.values[i]);
                }
                if(radiosToReset.length == 1) {
                    radiosToReset.push('none');
                }
                service.setGen(true);
                service.resetSpecificRadio(interaction.client, interaction, reply, respContent, radiosToReset);
            } else {
                try {
                    await reply.edit({ embeds: [emb.generate(`Désolé :(`, null, `Désolé il y a déjà quelque chose en cours de génération, pour éviter tout problème veuillez patienter quelques instants puis réessayez !`, "#FF0000", process.env.LSMS_LOGO_V2, null, `Gestion des véhicules`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], components: [], ephemeral: true });
                    await wait(5000);
                    await reply.delete();
                } catch (err) {
                    logger.error(err);
                    await interaction.reply({ embeds: [emb.generate(`Désolé :(`, null, `Désolé il y a déjà quelque chose en cours de génération, pour éviter tout problème veuillez patienter quelques instants puis réessayez !`, "#FF0000", process.env.LSMS_LOGO_V2, null, `Gestion des véhicules`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });
                    await wait(5000);
                    await interaction.deleteReply();
                }
            }
        }
    }
}