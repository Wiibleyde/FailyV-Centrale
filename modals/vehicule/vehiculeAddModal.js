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
//Récup du régénérateur de véhicules
const regenVeh = require('../../modules/regenVehicles');

module.exports = {
    //Création de la commande
    execute: async function (interaction, errEmb) {
        //Affichage du message "Iris réfléchis..."
        await interaction.deferReply({ ephemeral: true });
        const category = interaction.components[3].components[0].value.toLowerCase();
        const regexDate = /^(0[1-9]|1\d|2[0-8]|29(?=\/\d\d\/(?!1[01345789]00|2[1235679]00)\d\d(?:[02468][048]|[13579][26]))|30(?!\/02)|31(?=\/0[13578]|\/1[02]))\/(0[1-9]|1[0-2])\/([12]\d{3})$/gm;
        let date = interaction.components[2].components[0].value;
        if(!regexDate.test(date)) {
            return await interaction.reply({ embeds: [emb.generate(null, null, `La date du **contrôle technique** n'est pas une date valide !\n\nVous devez insérer une date au format **JJ/MM/AAAA**`, `#FF0000`, process.env.LSMS_LOGO_V2, null, `Gestion des véhicules`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });
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
            return await interaction.reply({ embeds: [emb.generate(null, null, `Désolé :(\nIl semblerait qu'il existe déjà un véhicule avec cette plaque d'immatriculation d'enregistré`, `#FF0000`, process.env.LSMS_LOGO_V2, null, `Gestion des véhicules`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });
        }
        const vehChanId = await sql.getChannelId();
        if(vehChanId[0] == null) {
            return interaction.followUp({ embeds: [emb.generate(`Oups :(`, null, `Aucun salon de gestion des véhicules n'a été trouvé en base de donnée\nVeuillez contacter un des développeurs (<@461880599594926080>, <@461807010086780930> ou <@368259650136571904>) pour régler ce problème !`, "#FF0000", process.env.LSMS_LOGO_V2, null, `Gestion des véhicules`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });
        }
        let vehiculeChannelID = vehChanId[0].id;
        const channelToSend = await interaction.guild.channels.cache.get(vehiculeChannelID);
        //Ajout des boutons sous l'embed pour gérer le véhicule
        const vehiclesBtns = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('vehAvailable').setStyle(ButtonStyle.Success).setEmoji("896393106700775544").setDisabled(true),
            new ButtonBuilder().setCustomId('vehNeedRepair').setStyle(ButtonStyle.Secondary).setEmoji("🔧").setDisabled(false),
            new ButtonBuilder().setCustomId('vehUnavailable').setStyle(ButtonStyle.Secondary).setEmoji("896393106633687040").setDisabled(false),
            new ButtonBuilder().setCustomId('vehEditCt').setStyle(ButtonStyle.Secondary).setEmoji("📆").setDisabled(false)
        );
        const sqlDate = new Date(`${date} UTC+0:00`).toISOString().slice(0, 19).replace('T', ' ');
        let catOrder;
        if(category == 'ambulance') { catOrder = '0'; }
        else if(category == 'romero') { catOrder = '1'; }
        else if(category == 'firetruk') { catOrder = '2'; }
        else if(category == 'fbi2') { catOrder = '3'; }
        else if(category == 'polmav') { catOrder = '4'; }
        else { catOrder = '5'; }
        await sql.set(interaction.components[0].components[0].value, plate, sqlDate, category, catOrder);
        const allVehicles = await sql.get();
        //Send embed with buttons
        await regenVeh.all(channelToSend, allVehicles);
        //Send confirmation message
        await interaction.followUp({ embeds: [emb.generate(null, null, `Le véhicule immatriculé **${plate}** a bien été ajouté à la liste !`, `#0DE600`, process.env.LSMS_LOGO_V2, null, `Gestion des véhicules`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });
        // Supprime la réponse après 5s
        await wait(5000);
        await interaction.deleteReply();
    }
}