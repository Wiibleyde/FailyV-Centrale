//Récup du logger
const logger = require('../modules/logger');
//Récup du créateur d'embed
const emb = require('../modules/embeds');

module.exports = {
    execute: async function(interaction, errEmb) {
        const message = interaction.message;
        //Remove the message
        await message.delete();
        //Send confirmation message ephemeral
        await interaction.reply({ content: `Le rendez-vous a bien été annulé.`, ephemeral: true });
    }
}
