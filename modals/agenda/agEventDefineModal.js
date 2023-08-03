const { GuildScheduledEventManager, GuildScheduledEventPrivacyLevel, GuildScheduledEventEntityType } = require('discord.js');
//Récup du logger
const logger = require('../../modules/logger');
//Récup des requêtes SQL
const sql = require('../../sql/agenda/agenda');
//Récup du créateur d'embed
const emb = require('../../modules/embeds');

const service = require('../../modules/service');

const wait = require('node:timers/promises').setTimeout;

module.exports = {
    execute: async function(interaction, errEmb) {

        const regexDate = /^(0[1-9]|1\d|2[0-8]|29(?=\/\d\d\/(?!1[01345789]00|2[1235679]00)\d\d(?:[02468][048]|[13579][26]))|30(?!\/02)|31(?=\/0[13578]|\/1[02]))\/(0[1-9]|1[0-2])\/([12]\d{3}) ([01]\d|2[0-3])h([0-5]\d)$/gm;
        if(!regexDate.test(interaction.fields.components[0].components[0].value)) {
            await interaction.reply({ embeds: [emb.generate(`Erreur :(`, null, `Attention, la date de cérémonie que vous avez entrée n'est pas valide !\nVérifiez bien qu'elle est au format "**JJ/MM/AAAA HHhmm**" et que cette date existe réellement !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, `Gestion décès`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });
            await wait(5000);
            return await interaction.deleteReply();
        }
        const date = interaction.fields.components[0].components[0].value.split('/');
        const hour = date[2].split('h');
        const formatedDate = date[1] + '/' + date[0] + '/' + hour[0] + ':' + hour[1];
        const testDate = new Date();
        const dateToTest = new Date(formatedDate);
        logger.debug(testDate);
        logger.debug(dateToTest);
        if(dateToTest <= testDate) {
            await interaction.reply({ embeds: [emb.generate(`Erreur :(`, null, `Attention, la date de cérémonie que vous avez entrée n'est pas valide !\nVérifiez bien qu'elle n'est pas déjà passée !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, `Gestion décès`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });
            await wait(5000);
            return await interaction.deleteReply();
        }
        service.setGen(true);
        let endDay = date[0];
        let endMonth = date[1];
        let endYear = date[2].split(' ');
        endYear = endYear[0];
        if(date[1] == '02') {
            if(date[0] == '28') {
                if ((0 == endYear % 4) && (0 != endYear % 100) || (0 == endYear % 400)) {
                    endDay = '29';
                } else {
                    endDay = '01';
                    endMonth = '03';
                }
            } else if(date[0] == '29') { endDay = '01'; endMonth = '03'; } else { endDay = (parseInt(date[0]) + 1).toString(); }
        } else if(date[1] == '12') { if(date[0] == '31') { endDay = '01'; endMonth = '01'; endYear = (parseInt(endYear) + 1).toString(); } else { endDay = (parseInt(date[0]) + 1).toString(); } }
        else if(date[1] == '01' || date[1] == '03' || date[1] == '05' || date[1] == '07' || date[1] == '08' || date[1] == '10') { if(date[0] == '31') { endDay = '01'; endMonth = (parseInt(date[1]) + 1).toString(); } else { endDay = (parseInt(date[0]) + 1).toString(); } }
        else if(date[1] == '04' || date[1] == '06' || date[1] == '09' || date[1] == '11') { if(date[0] == '30') { endDay = '01'; endMonth = (parseInt(date[1]) + 1).toString(); } else { endDay = (parseInt(date[0]) + 1).toString(); } }
        if (endDay.length < 2) endDay = '0' + endDay;
        if (endMonth.length < 2) endMonth = '0' + endMonth;

        const rendezVousEmb = interaction.message.embeds[0];
        const event = new GuildScheduledEventManager(interaction.guild);
        const createdEvent = await event.create({
            name: 'Cérémonie ' + rendezVousEmb.fields[0].value,
            scheduledStartTime: new Date(`${formatedDate}`),
            scheduledEndTime: new Date(`${endMonth + '/' + endDay + '/' + endYear} 00:00`),
            privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
            entityType: GuildScheduledEventEntityType.External,
            entityMetadata: { location: interaction.fields.components[1].components[0].value },
            description: `${rendezVousEmb.fields[3].name} : ${rendezVousEmb.fields[3].value}\n${rendezVousEmb.fields[4].name} : ${rendezVousEmb.fields[4].value}\n${rendezVousEmb.fields[5].name} : ${rendezVousEmb.fields[5].value}\n${rendezVousEmb.fields[7].name} : ${rendezVousEmb.fields[7].value}`,
            image: null,
            reason: `Les informations manquantes pour la création de l'événement ont été rajoutées (par ${interaction.member.nickname})`
        });
        await sql.updateToEventState(rendezVousEmb.fields[0].value, `https://discord.com/events/${createdEvent.guildId}/${createdEvent.id}`);
        await interaction.message.delete();
        await interaction.reply({ embeds: [emb.generate(null, null, `Les informations manquantes pour la cérémonie de **${rendezVousEmb.fields[0].value}** ont bien été prises en compte, l'événement à donc bien été créé !`, `#0DE600`, process.env.LSMS_LOGO_V2, null, `Gestion décès`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });
        service.setGen(false);
        await wait(5000);
        await interaction.deleteReply();
    }
}
