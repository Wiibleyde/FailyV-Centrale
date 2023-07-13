//Récupération des fonctions pour créer une liste
const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
//Récup du logger
const logger = require('./../modules/logger');
//Fichier de service pour reset
const service = require('./../modules/service');

module.exports = {
    execute: async function(interaction, errEmb) {
        //Logs de quel option du menu de selection à été utilisée
        logger.log(`${interaction.user.username}#${interaction.user.discriminator} (${interaction.user}) a utilisé(e) l'option "${interaction.values[0]}" du menu de séléction "${interaction.customId}"`);
        //Reset des radios
        if(interaction.values[0] == 'serviceRadioReset') {
            service.resetRadios(interaction.client, interaction);
        }
        const serviceRole = interaction.guild.roles.cache.get(process.env.IRIS_SERVICE_ROLE_ID);
        if(interaction.values[0] == 'serviceResetSomeone') {
            //Création d'une liste d'opération possible
            var options = new StringSelectMenuBuilder().setCustomId('serviceKickSingleSelect').setPlaceholder('Choisissez la/les personne(s) à retirer du service').setMinValues(1);
            //Ajout des opérations possibles
            var totalUser = 0;
            serviceRole.members.map(d => {
                options.addOptions(new StringSelectMenuOptionBuilder().setLabel(`${d.nickname}`).setValue(d.user.id));
                totalUser++;
            });
            options.setMaxValues(totalUser);
            const allOptions = new ActionRowBuilder().addComponents(options);
            //Envois
            const messages = await interaction.channel.messages.fetch();
            const msg = await service.getMessages(messages, interaction.client);
            try {
                await interaction.message.delete();
                await msg.reply({ components: [allOptions], ephemeral: true });
            } catch (err) {
                logger.error(err);
                await interaction.message.delete();
                await msg.reply({ embeds: [errEmb] });
            }
        }
        if(interaction.values[0] == 'serviceResetEveryone') {
        }
    }
}