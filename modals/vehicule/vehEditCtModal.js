//Récup des fonctions pour créer des boutons
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
//Récup du logger
const logger = require('../../modules/logger');
//Récup des requêtes SQL
const sql = require('../../sql/objectsManagement/vehicule');
//Récup du créateur d'embed
const emb = require('../../modules/embeds');

module.exports = {
    execute: async function(interaction, errEmb) {
        //Ajout des boutons sous l'embed pour gérer le véhicule
        const plate = interaction.components[1].components[0].value
        const regexDate = /^(([0-2]\d|[3][0-1])\/([0]\d|[1][0-2])\/[2][0]\d{2})$|^(([0-2]\d|[3][0-1])\/([0]\d|[1][0-2])\/[2][0]\d{2}\s([0-1]\d|[2][0-3])\:[0-5]\d\:[0-5]\d)$/;
        let date = interaction.components[0].components[0].value;
        if(!regexDate.test(date)) {
            return await interaction.reply({ embeds: [emb.generate(null, null, `La date du **contrôle technique** n'est pas une date valide !\n\nVous devez insérer une date au format **JJ/MM/AAAA**`, `#FF0000`, process.env.LSMS_LOGO_V2, null, `Gestion des véhicules`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).icon}.webp`, null, null, null, false)], ephemeral: true });
        } else {
            date = date.split('/');
            date = date[1] + '/' + date[0] + '/' + date[2];
        }
        const vehicleData = await sql.getByPlate(plate);
        if(vehicleData[0] == null) {
            return await interaction.reply({ embeds: [emb.generate(null, null, `**<:eyes_sus:1131588112749961266> Hummm**\nTu as touché à la plaque n'est ce pas ?\n\nFait attention celle que tu as mise n'existe pas dans le registre !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, `Gestion des véhicules`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).icon}.webp`, null, null, null, false)], ephemeral: true });
        }
        const vehiclesBtns = new ActionRowBuilder();
        await sql.updateCT(date, plate);

        if(vehicleData[0].state == '0') {
            vehiclesBtns.addComponents(
                new ButtonBuilder().setCustomId('vehAvailable').setStyle(ButtonStyle.Success).setEmoji("896393106700775544").setDisabled(true),
                new ButtonBuilder().setCustomId('vehNeedRepair').setStyle(ButtonStyle.Secondary).setEmoji("🔧").setDisabled(false),
                new ButtonBuilder().setCustomId('vehUnavailable').setStyle(ButtonStyle.Secondary).setEmoji("896393106633687040").setDisabled(false),
                new ButtonBuilder().setCustomId('vehEditCt').setStyle(ButtonStyle.Secondary).setEmoji("📆").setDisabled(false)
            );
        } else if(vehicleData[0].state == '1') {
            vehiclesBtns.addComponents(
                new ButtonBuilder().setCustomId('vehAvailable').setStyle(ButtonStyle.Secondary).setEmoji("896393106700775544").setDisabled(false),
                new ButtonBuilder().setCustomId('vehNeedRepair').setStyle(ButtonStyle.Primary).setEmoji("🔧").setDisabled(true),
                new ButtonBuilder().setCustomId('vehUnavailable').setStyle(ButtonStyle.Secondary).setEmoji("896393106633687040").setDisabled(false),
                new ButtonBuilder().setCustomId('vehEditCt').setStyle(ButtonStyle.Secondary).setEmoji("📆").setDisabled(false)
            );
        } else {
            vehiclesBtns.addComponents(
                new ButtonBuilder().setCustomId('vehAvailable').setStyle(ButtonStyle.Secondary).setEmoji("896393106700775544").setDisabled(false),
                new ButtonBuilder().setCustomId('vehNeedRepair').setStyle(ButtonStyle.Secondary).setEmoji("🔧").setDisabled(false),
                new ButtonBuilder().setCustomId('vehUnavailable').setStyle(ButtonStyle.Danger).setEmoji("896393106633687040").setDisabled(true),
                new ButtonBuilder().setCustomId('vehEditCt').setStyle(ButtonStyle.Secondary).setEmoji("📆").setDisabled(false)
            );
        }

        const message = interaction.channel.messages.fetch(vehicleData[0].messageID);
        message.edit({ content: `**${vehicleData[0].name} (${vehicleData[0].type}) \u200b- ${plate} \u200b- CT fait le: ${interaction.components[0].components[0].value}**`, components: [vehiclesBtns] });
        //Send confirmation message
        await interaction.reply({ embeds: [emb.generate(null, null, `La date du contrôle technique du véhicule immatriculé **${plate}** a bien été mise à jour sur ${interaction.components[0].components[0].value} !`, `#0DE600`, process.env.LSMS_LOGO_V2, null, `Gestion des véhicules`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).icon}.webp`, null, null, null, false)], ephemeral: true });
        // Supprime la réponse après 5s
        await wait(5000);
        await interaction.deleteReply();
    }
}