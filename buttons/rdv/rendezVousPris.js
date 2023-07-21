//Récup du logger
const logger = require('../../modules/logger');
//Récup du créateur d'embed
const emb = require('../../modules/embeds');
//Fonction pour attendre
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    execute: async function(interaction, errEmb) {
        const message = interaction.message;
        //Get username guild pseudo
        const pseudo = interaction.member.displayName;
        //Get the embed
        const rendezVousEmb = interaction.message.embeds[0];
        //Get now date
        const now = new Date();
        let day = now.getDate()
        if (day < 10) day = '0' + day;
        let month = now.getMonth() + 1;
        if (month < 10) month = '0' + month;
        const year = now.getFullYear();
        let hour = now.getHours();
        if (hour < 10) hour = '0' + hour;
        let minutes = now.getMinutes();
        if (minutes < 10) minutes = '0' + minutes;
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
        if(rendezVousEmb.fields[4] != null) {
            //Remove the field
            newEmbed.spliceFields(4, 1);
            //Add the new field
            newEmbed.addFields(
                {
                    name: `**Rendez-vous pris par**`,
                    value: `${pseudo} le ${day}/${month}/${year} à ${hour}:${minutes}`,
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
        // Supprime la réponse après 5s
        await wait(5000);
        await interaction.deleteReply();
    }
}
