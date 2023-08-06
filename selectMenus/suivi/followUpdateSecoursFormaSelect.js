//Récupération des fonctions pour créer une liste
const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
//Récup du logger
const logger = require('../../modules/logger');
//Récup du créateur d'embed
const emb = require('../../modules/embeds');
//Fonction pour attendre
const wait = require('node:timers/promises').setTimeout;
//Récup des requêtes SQL
const sqlMessages = require('../../sql/config/config');
const sqlFollowSecours = require('../../sql/suivi/secours');

module.exports = {
    execute: async function (interaction, errEmb) {
        await interaction.deferReply({ ephemeral: true });
        let isPatientNull = false;
        for(i=0;i<interaction.values.length;i++) {
            const patient = await sqlFollowSecours.getById(interaction.values[i]);
            if(patient[0] != null) {
                await sqlFollowSecours.setSelected(interaction.values[i]);
            } else {
                isPatientNull = true;
            }
        }
        //Création d'une liste d'opération possible
        const selectMenu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
            .setCustomId('followUpdateSecoursFormaSelect')
            .setPlaceholder('Choisissez la catégorie à assigner aux personnes selectionées')
            .addOptions(new StringSelectMenuOptionBuilder().setLabel(`Formateurs confirmés`).setValue(`2`))
            .addOptions(new StringSelectMenuOptionBuilder().setLabel(`Formations à valider`).setValue(`1`))
            .addOptions(new StringSelectMenuOptionBuilder().setLabel(`Intéressés par formation`).setValue(`0`))
            .setMinValues(1)
            .setMaxValues(1)
        );
        //Send confirmation message
        if(!isPatientNull) {
            try {
                const msgId = await sqlMessages.getMessage('secours6');
                const msg = await interaction.channel.messages.cache.get(msgId[0].id);
                msg.editReply({ components: [selectMenu], ephemeral: true });
            } catch(err) {
                logger.error(err);
                interaction.followUp({ components: [selectMenu], ephemeral: true });
            }
        } else {
            await interaction.followUp({ embeds: [emb.generate(null, null, `⚠️ Attention, il n'y a plus aucune personne encore présente dans cette liste à mettre à jour\nSi jamais il y en a encore veuillez réutiliser le bouton !`, `Gold`, process.env.LSMS_LOGO_V2, null, `Gestion des Premiers Secours`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });
        }
    }
}