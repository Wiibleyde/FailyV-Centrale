//Récup du logger
const logger = require('../../modules/logger');
//Récup du créateur d'embed
const emb = require('../../modules/embeds');
//Fonction pour attendre
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    execute: async function(interaction, errEmb) {
        //Get in the message the number of times the person has been contacted (embed = const rendezVousEmb = emb.generate(null, null, `**Nom et prénom:** ${nomPrenom}\n**Numéro de téléphone:** ${numero}\n**Description:** ${description}\n**Contacté:** 0 fois\n**Pris par:** ${pseudo}`, `#FF0000`, `https://cdn.discordapp.com/attachments/1083724872045297734/1124914370217005127/LSMS.png`, null, `Rendez-vous ${type}`, `https://cdn.discordapp.com/attachments/1083724872045297734/1124914370217005127/LSMS.png`, null, null, null, false);)
        const message = interaction.message;
        //Get the embed
        const rendezVousEmb = interaction.message.embeds[0];
        //Get the date
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
        const newEmbed = emb.generate(null, null, null, process.env.LSMS_COLORCODE, process.env.LSMS_LOGO_V2, null, `Prise de rendez-vous`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).icon}.webp`, null, rendezVousEmb.footer.text, null, false);
        for (let i = 0; i < rendezVousEmb.fields.length; i++) {
            newEmbed.addFields(
                {
                    name: rendezVousEmb.fields[i].name,
                    value: rendezVousEmb.fields[i].value,
                    inline: rendezVousEmb.fields[i].inline
                }
            );
        }
        //Get the number of times the person has been contacted
        let contacte = 0;
        if(rendezVousEmb.fields[3].value == '\u200b') {
            contacte = 0;
        } else {
            contacte = rendezVousEmb.fields[3].value;
            contacte = parseInt(contacte.split(' ')[0]);
        }
        contacte++;
        //Modify the embed to add at the end the username of the person who took the appointment
        let rdvPrisField;
        if(rendezVousEmb.fields[4] != null) {
            rdvPrisField = rendezVousEmb.fields[4];
            newEmbed.spliceFields(4, 1);
        }
        //Check if the appointment is already taken edit the field
        newEmbed.spliceFields(3, 1);
        //Add the new field
        newEmbed.addFields(
            {
                name: `**Contacté**`,
                value: `${contacte} fois\nDernier contacte : ${day}/${month}/${year} à ${hour}:${minutes}`,
                inline: true
            }
        );
        if(rdvPrisField != null) {
            newEmbed.addFields(
                {
                    name: `**Rendez-vous pris par**`,
                    value: `${pseudo}`,
                    inline: true
                }
            );
        }
        //Modify the message to update the embed
        await message.edit({ embeds: [newEmbed] });
        //Send confirmation message
        await interaction.reply({ content: `La personne a bien été contactée.`, ephemeral: true });
        // Supprime la réponse après 5s
        await wait(5000);
        await interaction.deleteReply();
    }
}
