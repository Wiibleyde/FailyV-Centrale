//Récupération des fonctions pour créer une liste
const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
//Récup du logger
const logger = require('../../modules/logger');
//Récup du créateur d'embed
const emb = require('../../modules/embeds');
//Fonction pour attendre
const wait = require('node:timers/promises').setTimeout;

const sqlFollow = require('../../sql/suivi/suivi');
const sqlFollowOrgan = require('../../sql/suivi/organes');

const format = require('../../modules/formatName');

const security = require('../../modules/service');

module.exports = {
    execute: async function(interaction, errEmb) {

        const chan = await sqlFollow.getFollowChannelId();
        if(chan[0] == null) {
            await interaction.reply({ embeds: [emb.generate(`Oups :(`, null, `❗ Attention, aucun salon de suivi n'a été trouvé en base de donnée\nVeuillez contacter un des développeurs (<@461880599594926080>, <@461807010086780930> ou <@368259650136571904>) pour régler ce problème !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, `Gestion des greffes`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });
            // Supprime la réponse après 5s
            await wait(5000);
            return await interaction.deleteReply();
        }

        if(security.isGen()) {
            await interaction.reply({ embeds: [emb.generate(`Oups :(`, null, `Désolé il y a déjà quelque chose en cours de génération, pour éviter tout problème veuillez patienter quelques instants puis réessayez !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, `Gestion des greffes`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });
            // Supprime la réponse après 5s
            await wait(5000);
            return await interaction.deleteReply();
        }

        //Création d'une liste d'opération possible
        let options = new StringSelectMenuBuilder().setCustomId('followRemoveOrgansPatientSelect').setPlaceholder('Choisissez le(s) patient(s) à retirer').setMinValues(1);
        //Ajout des opérations possibles
        let totalPatient = 0;
        const patients = await sqlFollowOrgan.getPatients();
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
                await interaction.reply({ components: [allOptions], ephemeral: true });
            } catch (err) {
                logger.error(err);
                //Confirmation à Discord du succès de l'opération
                await interaction.reply({ embeds: [errEmb], ephemeral: true });
            }
        } else {
            await interaction.reply({ embeds: [emb.generate(`Oups :(`, null, `Il semblerait qu'il n'y ait aucun patient en attente de greffe !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, `Gestion des greffes`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });
            // Supprime la réponse après 5s
            await wait(5000);
            await interaction.deleteReply();
        }
    }
}