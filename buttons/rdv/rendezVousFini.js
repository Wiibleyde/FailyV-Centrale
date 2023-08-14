//Récup du logger
const logger = require('../../modules/logger');
//Récup du module sql
const rdv = require('../../sql/rdvManagment/rdv');

module.exports = {
    execute: async function(interaction, errEmb) {
        const message = interaction.message;
        //Suppression du message
        await message.delete();
        rdv.deleteRDV(message.id);
    }
}