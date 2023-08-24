//Récup du logger
const logger = require('./logger');
//Récup du créateur d'embed
const emb = require('./embeds');
//Récup du générateur d'effectif
const workforce = require('./workforce');
//Récup du SQL pour les channels
const sql = require('../sql/config/config');
//Fonction pour attendre
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    execute: async (interaction) => {
        const serverIcon = `https://cdn.discordapp.com/icons/${interaction.guild.id}/${interaction.guild.icon}.webp`;
        const title = `Gestion de l'effectif`;
        if(interaction.user.id != '461880599594926080' && interaction.user.id != '461807010086780930' && interaction.user.id != '368259650136571904') {
            const embed = emb.generate(`Désolé :(`, null, `Cette commande est réservé à mes développeurs (<@461880599594926080>, <@461807010086780930> et <@368259650136571904>) !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, false);
            await interaction.followUp({ embeds: [embed], ephemeral: true });
            await wait(5000);
            return await interaction.deleteReply();
        }

        //Affichage du message "Iris réfléchis..."
        await interaction.deferReply({ ephemeral: true });
        let IRIS_WORKFORCE_CHANNEL_ID = await sql.getChannel('IRIS_WORKFORCE_CHANNEL_ID')
        if (IRIS_WORKFORCE_CHANNEL_ID[0] == undefined) {
            IRIS_WORKFORCE_CHANNEL_ID = null;
            await interaction.followUp({ embeds: [emb.generate(null, null, `Désolé, le channel de l'effectif n'est pas configuré !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, true)], ephemeral: true });
            // Supprime la réponse après 5s
            await wait(5000);
            await interaction.deleteReply();
            return;
        } else {
            IRIS_WORKFORCE_CHANNEL_ID = IRIS_WORKFORCE_CHANNEL_ID[0].id;
        }
        await interaction.followUp({ embeds: [emb.generate(null, null, `Effectif régénéré !`, `#0DE600`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, true)], ephemeral: true });
        await wait(5000);
        await interaction.deleteReply();
        await workforce.generateWorkforce(interaction.client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID));
    }
}