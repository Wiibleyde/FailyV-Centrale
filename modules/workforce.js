const logger = require("./logger");

//Récup du créateur d'embed
const emb = require('./embeds');

const doctorSql = require('./../sql/doctorManagement/doctor');

const sql = require('./../sql/config/config');

module.exports = {
    generateWorkforce: async (guild) => {
        // Récupération des ID des channels
        let IRIS_WORKFORCE_CHANNEL_ID = await sql.getChannel('IRIS_WORKFORCE_CHANNEL_ID')
        if (IRIS_WORKFORCE_CHANNEL_ID[0] == undefined) {
            IRIS_WORKFORCE_CHANNEL_ID = null;
            await interaction.followUp({ embeds: [emb.generate(null, null, `Désolé, le channel de l'effectif n'est pas configuré !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, `Gestion de l'effectif`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${guild.icon}.webp`, null, null, null, true)], ephemeral: true });
            // Supprime la réponse après 5s
            await wait(5000);
            await interaction.deleteReply();
            return;
        } else {
            IRIS_WORKFORCE_CHANNEL_ID = IRIS_WORKFORCE_CHANNEL_ID[0].id;
        }

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
            let rankMessage = '```';
            if (value.workforce.length > 0) {
                rankMessage = rankMessage + 'ansi';
                for (const i in value.workforce) {
                    rankMessage = rankMessage + `\n[2;37m-[0m`;
                    if (value.workforce[i].holydays) {
                        rankMessage = rankMessage + ` 🏝️`
                    }
                    rankMessage = rankMessage + ` [2;34m${value.workforce[i].name}[0m [2;37m|[0m [2;32m${value.workforce[i].phone_number}[0m [2;37m|[0m [2;35m${value.workforce[i].arrival_date}[0m`;
                }
            } else {
                rankMessage = rankMessage + '\n ';
            }
            rankMessage = rankMessage + '\n```';
            await channel.send(rankMessage);
        }
    }
};
