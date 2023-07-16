//Fichier de service pour reset
const service = require('./../modules/service');

module.exports = {
    execute: async function(interaction, errEmb) {
        //Reset des radios
        service.resetRadios(interaction.client, interaction);
    }
}