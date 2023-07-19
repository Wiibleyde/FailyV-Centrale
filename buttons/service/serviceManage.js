//Récupération des fonctions pour créer une liste
const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
//Récup du logger
const logger = require('./../modules/logger');
//Récup du créateur d'embed
const emb = require('./../modules/embeds');
//Fonction pour attendre
const wait = require('node:timers/promises').setTimeout;


module.exports = {
    execute: async function(interaction, errEmb) {
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
                await interaction.reply({ components: [allOptions], ephemeral: true });
            } catch (err) {
                logger.error(err);
                //Confirmation à Discord du succès de l'opération
                await interaction.reply({ embeds: [errEmb], ephemeral: true });
            }
        } else {
            await interaction.reply({ embeds: [emb.generate(null, null, `Désolé :(\nIl n'y a actuellement personnes en service`, `#FF0000`, process.env.LSMS_LOGO_V2, null, `Gestion du service`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).icon}.webp`, null, null, null, false)], ephemeral: true });
            // Supprime la réponse après 5s
            await wait(5000);
            await interaction.deleteReply();
        }
    }
}