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

const security = require('../../modules/service');

module.exports = {
    execute: async function(interaction, errEmb) {

        const chan = await sqlFollow.getFollowChannelId();
        if(chan[0] == null) {
            await interaction.reply({ embeds: [emb.generate(`Oups :(`, null, `❗ Attention, aucun salon de suivi n'a été trouvé en base de donnée\nVeuillez contacter un des développeurs (<@461880599594926080>, <@461807010086780930> ou <@368259650136571904>) pour régler ce problème !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, `Gestion des organes`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });
            // Supprime la réponse après 5s
            await wait(5000);
            return await interaction.deleteReply();
        }

        if(security.isGen()) {
            await interaction.reply({ embeds: [emb.generate(`Oups :(`, null, `Désolé il y a déjà quelque chose en cours de génération, pour éviter tout problème veuillez patienter quelques instants puis réessayez !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, `Gestion des organes`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });
            // Supprime la réponse après 5s
            await wait(5000);
            return await interaction.deleteReply();
        }

        //Création d'une liste d'opération possible
        let options = new StringSelectMenuBuilder().setCustomId('followRemoveOrgansSelect').setPlaceholder('Choisissez le(s) organe(s) à retirer').setMinValues(1);
        //Ajout des opérations possibles
        let totalOrgan = 0;
        const lungs = await sqlFollowOrgan.getAllLungs();
        const kidney = await sqlFollowOrgan.getAllKidney();
        const liver = await sqlFollowOrgan.getAllLiver();
        for(i=0; i<lungs.length;i++) {
            let name = lungs[i].type.charAt(0).toUpperCase() + lungs[i].type.slice(1);
            let side;
            if(lungs[i].side == '0') { side = ' G'; } else { side = ' D'; }
            let state;
            if(lungs[i].state == '0') { state = 'Sain'; } else { state = 'Non sain'; }
            options.addOptions(new StringSelectMenuOptionBuilder().setLabel(`${name + side} (${formatDate(lungs[i].expire_date)}) - ${state}`).setValue(lungs[i].id.toString()));
            totalOrgan++;
        }
        for(i=0; i<kidney.length;i++) {
            let name = kidney[i].type.charAt(0).toUpperCase() + kidney[i].type.slice(1);
            let side;
            if(kidney[i].side == '0') { side = ' G'; } else { side = ' D'; }
            let state;
            if(kidney[i].state == '0') { state = 'Sain'; } else { state = 'Non sain'; }
            options.addOptions(new StringSelectMenuOptionBuilder().setLabel(`${name + side} (${formatDate(kidney[i].expire_date)}) - ${state}`).setValue(kidney[i].id.toString()));
            totalOrgan++;
        }
        for(i=0; i<liver.length;i++) {
            let name = liver[i].type.charAt(0).toUpperCase() + liver[i].type.slice(1);
            let state;
            if(liver[i].state == '0') { state = 'Sain'; } else { state = 'Non sain'; }
            options.addOptions(new StringSelectMenuOptionBuilder().setLabel(`${name} (${formatDate(liver[i].expire_date)}) - ${state}`).setValue(liver[i].id.toString()));
            totalOrgan++;
        }
        options.setMaxValues(totalOrgan);
        if(totalOrgan != 0) {
            const allOptions = new ActionRowBuilder().addComponents(options);
            try {
                //Confirmation à Discord du succès de l'opération
                await interaction.reply({ components: [allOptions], ephemeral: true });
            } catch (err) {
                logger.error(err);
                //Confirmation à Discord du succès de l'opération
                await interaction.reply({ embeds: [errEmb], ephemeral: true });
            }
        } else {
            await interaction.reply({ embeds: [emb.generate(`Oups :(`, null, `Il semblerait qu'il n'y ait aucun organe présent dans la liste de suivi !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, `Gestion des organes`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });
            // Supprime la réponse après 5s
            await wait(5000);
            await interaction.deleteReply();
        }
    }
}

function formatDate(timestamp) {
    const date = new Date(timestamp + ' UTC+0:00');
    let month = date.getMonth() + 1;
    if (month < 10) month = '0' + month;
    let day = date.getDate();
    if (day < 10) day = '0' + day;
    return day + '/' + month;
}