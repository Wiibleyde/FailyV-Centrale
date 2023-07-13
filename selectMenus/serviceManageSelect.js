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
    }
}