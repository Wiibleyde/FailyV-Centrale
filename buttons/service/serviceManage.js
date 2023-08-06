//Récupération des fonctions pour créer une liste
const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
//Récup du logger
const logger = require('../../modules/logger');
//Récup du créateur d'embed
const emb = require('../../modules/embeds');
//Fonction pour attendre
const wait = require('node:timers/promises').setTimeout;
//Récup du systeme de logs RP
const logRP = require('../../modules/logsRP');

const serviceID = process.env.IRIS_SERVICE_ROLE_ID;
const dispatchID = process.env.IRIS_DISPATCH_ROLE_ID;
const offID = process.env.IRIS_OFF_ROLE_ID;

let reply;

module.exports = {
    execute: async function(interaction, errEmb) {
        if(interaction.customId == 'serviceManage') {
            reply = null;
            const serviceRole = interaction.guild.roles.cache.get(process.env.IRIS_SERVICE_ROLE_ID);
            //Création d'une liste d'opération possible
            var options = new StringSelectMenuBuilder().setCustomId('serviceKickSingleSelect').setPlaceholder('Choisissez la/les personne(s) à retirer du service').setMinValues(1);
            //Ajout des opérations possibles
            var totalUser = 0;
            serviceRole.members.map(d => {
                options.addOptions(new StringSelectMenuOptionBuilder().setLabel(`${d.nickname}`).setValue(d.user.id));
                totalUser++;
            });
            options.setMaxValues(totalUser);
            if(totalUser != 0) {
                const allOptions = new ActionRowBuilder().addComponents(options);
                try {
                    //Confirmation à Discord du succès de l'opération
                    reply = await interaction.reply({ components: [allOptions], ephemeral: true });
                } catch (err) {
                    logger.error(err)
                    //Confirmation à Discord du succès de l'opération
                    await interaction.reply({ embeds: [errEmb], ephemeral: true });
                }
            } else {
                await interaction.reply({ embeds: [emb.generate(null, null, `Désolé :(\nIl n'y a actuellement personnes en service`, `#FF0000`, process.env.LSMS_LOGO_V2, null, `Gestion du service`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });
                // Supprime la réponse après 5s
                await wait(5000);
                await interaction.deleteReply();
            }
        } else if(interaction.customId == 'serviceKickSingleSelect') {
            //Confirmation à Discord du succès de l'opération
            try {
                await reply.edit({ embeds: [emb.generate(null, null, `<a:loading:1137771560531398697> Mise à jour en cours...`, `Gold`, process.env.LSMS_LOGO_V2, null, `Gestion du service`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], components: [], ephemeral: true });
            } catch (err) {
                await interaction.deferReply({ ephemeral: true });
            }
            let respContent = '';
            for(i=0;i<interaction.values.length;i++) {
                const user = interaction.guild.members.cache.get(interaction.values[i]);
                if(i == 0) {
                    respContent = respContent + `<@${interaction.values[i]}>`
                } else if(i != interaction.values.length - 1) {
                    respContent = respContent + `, <@${interaction.values[i]}>`
                } else {
                    respContent = respContent + ` et <@${interaction.values[i]}>`
                }
                let switchRole = interaction.guild.roles.cache.find(role => role.id === serviceID);
                if(user.roles.cache.has(serviceID)) {
                    if(user.roles.cache.has(dispatchID)) {
                        let dispatchRole = interaction.guild.roles.cache.find(role => role.id === dispatchID);
                        user.roles.remove(dispatchRole);
                        logRP.fdd(interaction.guild, user.nickname, interaction.member.nickname);
                    }
                    if(user.roles.cache.has(offID)) {
                        let offRole = interaction.guild.roles.cache.find(role => role.id === offID);
                        user.roles.remove(offRole);
                    }
                    user.roles.remove(switchRole);
                    logRP.fds(interaction.guild, user.nickname, interaction.member.nickname);
                    try {
                        await user.send({ embeds: [emb.generate(`Bonjour, ${user.nickname}`, null, `Vous n'avez pas pris votre fin de service.\nMerci d'y penser à l'avenir !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, `Gestion du service`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, `Cordialement, ${interaction.member.nickname}`, null, true)] });
                    } catch(err) {
                    }
                }
            }
            try {
                reply.edit({ embeds: [emb.generate(null, null, respContent + ` a/ont correctement été retiré(s) du service !`, `#0DE600`, process.env.LSMS_LOGO_V2, null, `Gestion du service`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, true)], components: [], ephemeral: true });
                // Supprime la réponse après 5s
                await wait(5000);
                await reply.delete();
            } catch (err) {
                logger.error(err);
                interaction.followUp({ embeds: [emb.generate(null, null, respContent + ` a/ont correctement été retiré(s) du service !`, `#0DE600`, process.env.LSMS_LOGO_V2, null, `Gestion du service`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, true)], ephemeral: true });
                // Supprime la réponse après 5s
                await wait(5000);
                await interaction.deleteReply();
            }
        }
    }
}