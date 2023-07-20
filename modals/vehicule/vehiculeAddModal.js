//Récup des fonctions pour créer des boutons
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
//Récup du logger
const logger = require('../../modules/logger');
//Récup du créateur d'embed
const emb = require('../../modules/embeds');
//Fonction pour attendre
const wait = require('node:timers/promises').setTimeout;
//Récup des requêtes SQL
const sql = require('../../sql/objectsManagement/vehicule');

module.exports = {
    //Création de la commande
    execute: async function (interaction, errEmb) {
        const category = interaction.components[3].components[0].value.toLowerCase();
        const regexDate = /^(([0-2]\d|[3][0-1])\/([0]\d|[1][0-2])\/[2][0]\d{2})$|^(([0-2]\d|[3][0-1])\/([0]\d|[1][0-2])\/[2][0]\d{2}\s([0-1]\d|[2][0-3])\:[0-5]\d\:[0-5]\d)$/;
        let date = interaction.components[2].components[0].value;
        if(!regexDate.test(date)) {
            return await interaction.reply({ embeds: [emb.generate(null, null, `La date du **contrôle technique** n'est pas une date valide !\n\nVous devez insérer une date au format **JJ/MM/AAAA**`, `#FF0000`, process.env.LSMS_LOGO_V2, null, `Gestion des véhicules`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).icon}.webp`, null, null, null, false)], ephemeral: true });
        } else {
            date = date.split('/');
            date = date[1] + '/' + date[0] + '/' + date[2];
        }
        //Regex des numéros de téléphone
        const regExpMidFull = new RegExp("^LSMS[0-9]{3}$");
        const regExp = new RegExp("^[0-9]{3}$");
        let plate = interaction.components[1].components[0].value;
        if (regExpMidFull.test(interaction.components[1].components[0].value)) {
            plate = interaction.components[1].components[0].value.substring(4);
            plate = `LSMS ${plate}`;
        } else if (regExp.test(interaction.components[1].components[0].value)) {
            plate = `LSMS ${interaction.components[1].components[0].value}`;
        }
        const isVehicleExist = await sql.getByPlate(plate);
        if(isVehicleExist[0] != null) {
            return await interaction.reply({ embeds: [emb.generate(null, null, `Désolé :(\nIl semblerait qu'il existe déjà un véhicule avec cette plaque d'immatriculation d'enregistré`, `#FF0000`, process.env.LSMS_LOGO_V2, null, `Gestion des véhicules`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).icon}.webp`, null, null, null, false)], ephemeral: true });
        }
        //Get channel by looking at env var
        const channelToSend = interaction.client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).channels.cache.get(process.env.IRIS_VEHICLES_CHANNEL_ID);
        //Ajout des boutons sous l'embed pour gérer le véhicule
        const vehiclesBtns = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('vehAvailable').setStyle(ButtonStyle.Success).setEmoji("896393106700775544").setDisabled(true),
            new ButtonBuilder().setCustomId('vehNeedRepair').setStyle(ButtonStyle.Secondary).setEmoji("🔧").setDisabled(false),
            new ButtonBuilder().setCustomId('vehUnavailable').setStyle(ButtonStyle.Secondary).setEmoji("896393106633687040").setDisabled(false),
            new ButtonBuilder().setCustomId('vehEditCt').setStyle(ButtonStyle.Secondary).setEmoji("📆").setDisabled(false)
        );
        const sqlDate = new Date(`${date} UTC+0:00`).toISOString().slice(0, 19).replace('T', ' ');
        //Send embed with buttons
        const msg = await channelToSend.send({ content: `**${interaction.components[0].components[0].value} (${category}) \u200b- ${plate} \u200b- CT fait le: ${interaction.components[2].components[0].value}**`, components: [vehiclesBtns] });
        await sql.set(interaction.components[0].components[0].value, plate, sqlDate, category, msg.id);
        //Send confirmation message
        await interaction.reply({ embeds: [emb.generate(null, null, `Le véhicule immatriculé **${plate}** a bien été ajouté à la liste !`, `#0DE600`, process.env.LSMS_LOGO_V2, null, `Gestion des véhicules`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).icon}.webp`, null, null, null, false)], ephemeral: true });
        // Supprime la réponse après 5s
        await wait(5000);
        await interaction.deleteReply();
    }
}