//Récup du logger
const logger = require('../../modules/logger');
//Récup du créateur d'embed
const emb = require('../../modules/embeds');

module.exports = {
    execute: async function(interaction, errEmb) {
        const message = interaction.message;
        //Get username guild pseudo
        const pseudo = interaction.member.displayName;
        //Get the embed
        const rendezVousEmb = message.embeds[0];
        //Modify the embed change the color to green
        rendezVousEmb.color = `#00FF00`;
        //Modify the embed to add the username of the person who took the appointment
        rendezVousEmb.description = rendezVousEmb.description.replace(`**Pris par:** ${pseudo}`, `**Pris par:** ${pseudo} (terminé)`);
        //Modify the message to update the embed
        await message.edit({ embeds: [rendezVousEmb] });
        //Send confirmation message
        await interaction.reply({ content: `Le rendez-vous a bien été pris.`, ephemeral: true });
    }
}
