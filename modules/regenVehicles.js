//Récupération des fonctions pour créer des boutons
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
//Récup des requêtes SQL pour les véhicules
const sqlVeh = require('./../sql/objectsManagement/vehicule');
//Récup du logger
const logger = require('./logger');
//Récup du créateur d'embed
const emb = require('./embeds');

module.exports = {
    all: (channel, vehicles) => {
        return new Promise(async (resolve, reject) => {
            const foundVeh = await channel.messages.fetch();
            foundVeh.forEach(message => {
                message.delete();
            });

            for(let i=0; i<vehicles.length;i++) {
                const name = vehicles[i].name;
                const plate = vehicles[i].plate;
                const date = new Date(vehicles[i].ct);
                const year = date.getFullYear();
                let month = date.getMonth() + 1;
                if (month < 10) month = '0' + month;
                let day = date.getDate();
                if (day < 10) day = '0' + day;
                const formatedDate = day + '/' + month + '/' + year;
                const vehicleState = vehicles[i].state;
                const type = vehicles[i].type;
                const type_order = vehicles[i].type_order;
                //Ajout des boutons sous l'embed pour gérer le véhicule
                const vehiclesBtns = new ActionRowBuilder();
                if(vehicleState == '0') {
                    vehiclesBtns.addComponents(
                        new ButtonBuilder().setCustomId('vehAvailable').setStyle(ButtonStyle.Success).setEmoji("896393106700775544").setDisabled(true),
                        new ButtonBuilder().setCustomId('vehNeedRepair').setStyle(ButtonStyle.Secondary).setEmoji("🔧").setDisabled(false),
                        new ButtonBuilder().setCustomId('vehUnavailable').setStyle(ButtonStyle.Secondary).setEmoji("896393106633687040").setDisabled(false),
                        new ButtonBuilder().setCustomId('vehEditCt').setStyle(ButtonStyle.Secondary).setEmoji("📆").setDisabled(false)
                    );
                } else if(vehicleState == '1') {
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
                if(vehicles[i-1] == null || type != vehicles[i-1].type) {
                    let typeName;
                    if(type_order == '0') { typeName = 'Ambulances'; }
                    if(type_order == '1') { typeName = 'Corbillards'; }
                    if(type_order == '2') { typeName = 'Fire Trucks'; }
                    if(type_order == '3') { typeName = 'SUVs'; }
                    if(type_order == '4') { typeName = 'Hélicoptères'; }
                    if(type_order == '5') { typeName = 'Autres'; }
                    const getInCat = await sqlVeh.getByCategory(type_order);
                    const numInCat = getInCat.length;
                    await channel.send({ embeds: [emb.generate(null, null, `**${typeName}** - ${numInCat}`, process.env.LSMS_COLORCODE, null, null, null, null, null, null, null, false)] });
                }
                const pre = "```ansi\n";
                const post = "\n```";
                const newMsg = await channel.send({ content: pre + `[2;37m${name} (${type}) \u200b- [0m[2;34m[0m[2;34m${plate}[0m[2;34m[0m[2;37m \u200b- CT fait le: [0m[2;34m[0m[2;37m[2;33m${formatedDate}[0m[2;37m[0m[2;34m[0m` + post, components: [vehiclesBtns] });
                sqlVeh.updateMessageID(newMsg.id, plate);
            }
            resolve('Ok!');
        });
    }
}