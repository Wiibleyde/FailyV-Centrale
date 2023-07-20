//Récup des fonctions pour créer des boutons
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
//Récup du logger
const logger = require('../../modules/logger');
//Récup du créateur d'embed
const emb = require('../../modules/embeds');
//Fonction pour attendre
const wait = require('node:timers/promises').setTimeout;
//Récup des requêtes SQL
const sql = require('../../sql/objectsManagement/vehicule');
//Récup du régénérateur de véhicules
const regenVeh = require('../../modules/regenVehicles');

module.exports = {
    //Création de la commande
    execute: async function (interaction, errEmb) {
        //Logs de quel option du menu de selection à été utilisée
        logger.log(`${interaction.user.username}#${interaction.user.discriminator} (${interaction.user}) a utilisé(e) l'option "${interaction.values}" du menu de séléction "${interaction.customId}"`);
        let respContent = 'Le(s) véhicule(s) immatriculé(s) ';
        let isVehNull = false;
        for(i=0;i<interaction.values.length;i++) {
            const vehicules = await sql.getByPlate(interaction.values[i]);
            if(vehicules[0] != null) {
                await sql.delete(vehicules[0].plate);
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
            const allVehicles = sql.get();
            //Récupération du channel des véhicules
            const vehChan = interaction.guild.channels.cache.get(process.env.IRIS_VEHICLES_CHANNEL_ID);
            await regenVeh.all(vehChan, allVehicles);
            await interaction.reply({ embeds: [emb.generate(null, null, `${respContent} a/ont bien été retiré(s) de la liste !`, `#0DE600`, process.env.LSMS_LOGO_V2, null, `Gestion des véhicules`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).icon}.webp`, null, null, null, false)], ephemeral: true });
            // Supprime la réponse après 5s
            await wait(5000);
            await interaction.deleteReply();
        } else {
            await interaction.reply({ embeds: [emb.generate(null, null, `⚠️ Attention, il n'y a plus aucun véhicule encore présent dans cette liste à supprimer\nSi jamais il en reste encore veuillez refaire la commande !`, `Gold`, process.env.LSMS_LOGO_V2, null, `Gestion des véhicules`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).icon}.webp`, null, null, null, false)], ephemeral: true });
        }
    }
}