const logger = require("./logger");

//Récup du créateur d'embed
const emb = require('./embeds');

const doctorSql = require('./../sql/doctorManagement/doctor');

const sql = require('./../sql/config/config');
const IRIS_WORKFORCE_CHANNEL_ID = sql.getChannel('IRIS_WORKFORCE_CHANNEL_ID')[0].id;

module.exports = {
    generateWorkforce: async (guild) => {
        // Récupération des infos des docteurs
        const allDoctor = await doctorSql.getAllDoctor();

        // Récupération du channel effectif
        const channel = guild.channels.cache.get(IRIS_WORKFORCE_CHANNEL_ID);

        // Suppression des messages existant
        const channelMessages = await channel.messages.fetch();
        channelMessages.forEach(message => {
            message.delete();
        });

        // Récupération du nombre de docteur et affiche de l'enbed de l'effectif
        const nbDoctor = await doctorSql.getNbDoctor();
        const embed = emb.generate(`Effectif du LSMS - ${nbDoctor}`, null, null, process.env.LSMS_COLORCODE, null, null, null, null, null, null, null, false);
        await channel.send({ embeds: [embed] });

        // Affichage de l'effectif par grade
        for (const [_, value] of Object.entries(allDoctor)) {
            const embed = emb.generate(null, null, `**${guild.roles.cache.get(value.role_id).name}** - ${value.workforce.length}`, guild.roles.cache.get(value.role_id).hexColor, null, null, null, null, null, null, null, false);
            await channel.send({ embeds: [embed] });
            let rankMessage = "```ansi";
            if (value.workforce.length > 0) {
                for (const i in value.workforce) {
                    rankMessage = rankMessage + `\n[2;32m${value.workforce[i].arrival_date}[0m - [2;34m${value.workforce[i].phone_number}[0m ${value.workforce[i].first_name} ${value.workforce[i].last_name}`;
                }
            } else {
                rankMessage = rankMessage + "\n ";
            }
            rankMessage = rankMessage + "\n```";
            await channel.send(rankMessage);
        }
    }
};
