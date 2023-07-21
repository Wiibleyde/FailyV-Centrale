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
        const rendezVousEmb = interaction.message.embeds[0];
        //Create new embed
        const newEmbed = emb.generate(null, null, null, `#00FF00`, process.env.LSMS_LOGO_V2, null, `Prise de rendez-vous`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).icon}.webp`, null, rendezVousEmb.footer.text, null, false);
        for (let i = 0; i < rendezVousEmb.fields.length; i++) {
            newEmbed.addFields(
                {
                    name: rendezVousEmb.fields[i].name,
                    value: rendezVousEmb.fields[i].value,
                    inline: rendezVousEmb.fields[i].inline
                }
            );
        }
        //Modify the embed to add at the end the username of the person who took the appointment
        //Check if the appointment is already taken edit the field
        if(rendezVousEmb.fields[3] != null) {
            //Remove the field
            newEmbed.spliceFields(3, 1);
            //Add the new field
            newEmbed.addFields(
                {
                    name: `**Rendez-vous pris par**`,
                    value: `${pseudo}`,
                    inline: false
                }
            );
        } else {
            newEmbed.addFields(
                {
                    name: `**Rendez-vous pris par**`,
                    value: `${pseudo}`,
                    inline: false
                }
            );
        }
        //Modify the message to update the embed
        await message.edit({ embeds: [newEmbed] });
        //Send confirmation message
        await interaction.reply({ content: `Le rendez-vous a bien été pris.`, ephemeral: true });
    }
}
