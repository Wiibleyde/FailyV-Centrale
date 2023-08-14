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
//Récup du service de kick
const service = require('../../modules/kickservice');

const serviceID = process.env.IRIS_SERVICE_ROLE_ID;
const dispatchID = process.env.IRIS_DISPATCH_ROLE_ID;
const offID = process.env.IRIS_OFF_ROLE_ID;

let reply;

module.exports = {
    execute: async function(interaction, errEmb) {
        if(interaction.customId == 'serviceManage') {
            reply = null;
            //Création d'une liste d'opération possible
            let options = new StringSelectMenuBuilder().setCustomId('serviceManageSelect').setPlaceholder(`Choisissez l'action à effectuer`).setMinValues(1).setMaxValues(1);
            options.addOptions(new StringSelectMenuOptionBuilder().setLabel(`Retirer une/des personne(s) spécifique(s) du service`).setValue('serviceManageKickSingle'));
            options.addOptions(new StringSelectMenuOptionBuilder().setLabel(`Retirer toutes les personnes en service`).setValue('serviceManageKickEveryone'));
            const allOptions = new ActionRowBuilder().addComponents(options);
            try {
                reply = await interaction.reply({ components: [allOptions], ephemeral: true });
            } catch (err) {
                logger.error(err);
                await interaction.reply({ embeds: [errEmb], ephemeral: true });
            }
        } else if(interaction.customId == 'serviceManageSelect') {
            const serviceRole = interaction.guild.roles.cache.get(process.env.IRIS_SERVICE_ROLE_ID);
            let totalUser = 0;
            serviceRole.members.map(d => {
                totalUser++;
            });

            if(totalUser == 0) {
                try {
                    await reply.edit({ embeds: [emb.generate(null, null, `Désolé :(\nIl n'y a actuellement personnes en service`, `#FF0000`, process.env.LSMS_LOGO_V2, null, `Gestion du service`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], components: [], ephemeral: true });
                    // Supprime la réponse après 5s
                    await wait(5000);
                    return await reply.delete();
                } catch (err) {
                    logger.error(err);
                    await interaction.reply({ embeds: [emb.generate(null, null, `Désolé :(\nIl n'y a actuellement personnes en service`, `#FF0000`, process.env.LSMS_LOGO_V2, null, `Gestion du service`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });
                    // Supprime la réponse après 5s
                    await wait(5000);
                    return await interaction.deleteReply();
                }
            }

            if(interaction.values[0] == 'serviceManageKickSingle') {
                //Création d'une liste d'opération possible
                let options = new StringSelectMenuBuilder().setCustomId('serviceKickSingleSelect').setPlaceholder('Choisissez la/les personne(s) à retirer du service').setMinValues(1);
                //Ajout des opérations possibles
                serviceRole.members.map(d => {
                    options.addOptions(new StringSelectMenuOptionBuilder().setLabel(`${d.nickname}`).setValue(d.user.id));
                });
                options.setMaxValues(totalUser);
                await interaction.deferUpdate();
                const allOptions = new ActionRowBuilder().addComponents(options);
                try {
                    await reply.edit({ components: [allOptions], ephemeral: true });
                } catch (err) {
                    logger.error(err);
                    await interaction.reply({ components: [allOptions], ephemeral: true });
                }
            } else if(interaction.values[0] == 'serviceManageKickEveryone') {
                await interaction.deferUpdate();
                try {
                    await reply.edit({ embeds: [emb.generate(null, null, `<a:loading:1140500830672392283> Retrait des personnes du service en cours...`, `Gold`, process.env.LSMS_LOGO_V2, null, `Gestion du service`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], components: [], ephemeral: true });
                } catch (err) {
                    await interaction.deferReply({ ephemeral: true });
                }
                await service.kick(interaction.guild, interaction.guild.members.cache.get(interaction.user.id), true);
                try {
                    await reply.edit({ embeds: [emb.generate(null, null, `Toutes les personnes ont correctement été retirées du service !`, `#0DE600`, process.env.LSMS_LOGO_V2, null, `Gestion du service`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, true)], components: [], ephemeral: true });
                    // Supprime la réponse après 5s
                    await wait(5000);
                    await reply.delete();
                } catch (err) {
                    logger.error(err);
                    await interaction.followUp({ embeds: [emb.generate(null, null, `Toutes les personnes ont correctement été retirées du service !`, `#0DE600`, process.env.LSMS_LOGO_V2, null, `Gestion du service`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, true)], ephemeral: true });
                    // Supprime la réponse après 5s
                    await wait(5000);
                    await interaction.deleteReply();
                }
            }
        } else if(interaction.customId == 'serviceKickSingleSelect') {
            //Confirmation à Discord du succès de l'opération
            try {
                await reply.edit({ embeds: [emb.generate(null, null, `<a:loading:1140500830672392283> Retrait des personnes du service en cours...`, `Gold`, process.env.LSMS_LOGO_V2, null, `Gestion du service`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], components: [], ephemeral: true });
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
                        await logRP.fdd(interaction.guild, user.nickname, interaction.member.nickname);
                    }
                    if(user.roles.cache.has(offID)) {
                        let offRole = interaction.guild.roles.cache.find(role => role.id === offID);
                        user.roles.remove(offRole);
                    }
                    user.roles.remove(switchRole);
                    await logRP.fds(interaction.guild, user.nickname, interaction.member.nickname);
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