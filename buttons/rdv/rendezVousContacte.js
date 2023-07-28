//Récup du logger
const logger = require('../../modules/logger');
//Récup du créateur d'embed
const emb = require('../../modules/embeds');
//Récup du module sql
const rdv = require('../../sql/rdvManagment/rdv');

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
        let color = rendezVousEmb.color;
        if(color == parseInt(process.env.LSMS_COLORCODE.split('#')[1], 16)) {
            color = parseInt('#5865f2'.split('#')[1], 16);
        }
        const newEmbed = emb.generate(null, null, null, color, process.env.LSMS_LOGO_V2, null, `Prise de rendez-vous`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, rendezVousEmb.footer.text, null, false);
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
        let contacte = parseInt(rendezVousEmb.fields[3].value.split('**')[1]);
        contacte++;
        //Check if the appointment is already taken edit the field
        newEmbed.spliceFields(3, 1);
        //Add the new field
        newEmbed.addFields(
            {
                name: `**Contacté**`,
                value: `**${contacte}** fois\nDernière fois contacté : le **${day}/${month}/${year}** à **${hour}:${minutes}**`,
                inline: true
            }
        );
        //Modify the embed to add at the end the username of the person who took the appointment
        if(rendezVousEmb.fields[4] != null) {
            let rdvPrisField = rendezVousEmb.fields[4];
            newEmbed.spliceFields(3, 1);
            newEmbed.addFields(rdvPrisField);
        }
        await rdv.updateRDVContact(`**${contacte}** fois\nDernière fois contacté : le **${day}/${month}/${year}** à **${hour}:${minutes}**`, color, message.id);
        //Modify the message to update the embed
        await message.edit({ embeds: [newEmbed] });
        //Send confirmation message
        await interaction.deferUpdate();
    }
}
