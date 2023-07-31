//Récupération des fonctions pour créer une commande
const { SlashCommandBuilder, ChannelType } = require('discord.js');
//Récup du logger
const logger = require('../../modules/logger');
// Récup du gestionnaire d'autoriasation
const { Rank, hasAuthorization } = require('../../modules/rankAuthorization');
//Récup du créateur d'embed
const emb = require('../../modules/embeds');
//Récup du générateur d'effectif
const workforce = require('../../modules/workforce');
//Récup du SQL pour les channels
const sql = require('../../sql/config/config');
//Fonction pour attendre
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    //Création de la commande
    data: new SlashCommandBuilder()
        .setName('regenerate_workforce')
        .setDescription("[Direction] Regénération de l'effectif"),
    async execute(interaction) {
        //Affichage du message "Iris réfléchis..."
        await interaction.deferReply({ ephemeral: true });
        let IRIS_WORKFORCE_CHANNEL_ID = await sql.getChannel('IRIS_WORKFORCE_CHANNEL_ID')
        if (IRIS_WORKFORCE_CHANNEL_ID[0] == undefined) {
            IRIS_WORKFORCE_CHANNEL_ID = null;
            await interaction.followUp({ embeds: [emb.generate(null, null, `Désolé, le channel de l'effectif n'est pas configuré !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, `Gestion de l'effectif`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, true)], ephemeral: true });
            // Supprime la réponse après 5s
            await wait(5000);
            await interaction.deleteReply();
            return;
        } else {
            IRIS_WORKFORCE_CHANNEL_ID = IRIS_WORKFORCE_CHANNEL_ID[0].id;
        }
        await interaction.deleteReply();
        await workforce.generateWorkforce(interaction.guild);
    },
};
