//Récup du logger
const logger = require('../../modules/logger');
//Récup du créateur d'embed
const emb = require('../../modules/embeds');
//Fonction pour attendre
const wait = require('node:timers/promises').setTimeout;
//Récup du module sql des inspections
const inspectionSQL = require('../../sql/inspection/inspection');

module.exports = {
    execute: async function (interaction, errEmb) {
        const regexDate = /^(0[1-9]|1\d|2[0-8]|29(?=\/02\/(?!1[01345789]00|2[1235679]00)\d\d(?:[02468][048]|[13579][26]))|29(?!\/02)|30(?!\/02)|31(?=\/0[13578]|\/1[02]))\/(0[1-9]|1[0-2])\/([12]\d{3})$/gm
        const company = interaction.components[0].components[0].value
        const doctors = interaction.components[1].components[0].value
        let date = interaction.components[2].components[0].value
        if(date == '') {
            const now = new Date();
            let day = now.getDate()
            if (day < 10) day = '0' + day;
            let month = now.getMonth() + 1;
            if (month < 10) month = '0' + month;
            const year = now.getFullYear();
            date = `${year}/${month}/${day}`;
        } else {
            if(!regexDate.test(date)) {
                await interaction.reply({ embeds: [emb.generate(`Erreur :(`, null, `Attention, la date que vous avez entrée n'est pas valide !\nVérifiez bien qu'elle est au format "**JJ/MM/AAAA**" et que cette date existe réellement !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, `Gestion des inspections`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });
                await wait(5000);
                return await interaction.deleteReply();
            } else {
                const now = new Date()
                dateFormat = date.split('/')
                dateFormat = new Date(dateFormat[2] + "-" + dateFormat[1] + "-" + dateFormat[0] + " " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds())
                if(dateFormat > now) {
                    await interaction.reply({ embeds: [emb.generate(`Erreur :(`, null, `Attention, la date que vous avez entrée est dans futur.`, `#FF0000`, process.env.LSMS_LOGO_V2, null, `Gestion des inspections`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });
                    await wait(5000);
                    return await interaction.deleteReply();
                } 
                const dateSplit = date.split('/');
                date = `${dateSplit[2]}/${dateSplit[1]}/${dateSplit[0]}`;
            }
        }
        const testResult = await inspectionSQL.testInspection(company)
        if(!testResult) {
            await inspectionSQL.addInspection(doctors,company,date)
            await interaction.reply({ embeds: [emb.generate(`Succès !`, null, `L'inspection a bien été ajoutée !`, `#00FF00`, process.env.LSMS_LOGO_V2, null, `Gestion des inspections`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });
            await wait(5000);
            await interaction.deleteReply();
        } else {
            await inspectionSQL.updateInspection(doctors,company,date)
            await interaction.reply({ embeds: [emb.generate(`Succès !`, null, `L'inspection a bien été mise à jour !`, `#00FF00`, process.env.LSMS_LOGO_V2, null, `Gestion des inspections`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });
            await wait(5000);
            await interaction.deleteReply();
        }
    }
}