//Récupération des fonctions pour créer des boutons
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
//Récup du logger
const logger = require('./logger');

module.exports = {
    genBedsBtns: (buttons) => {
        const btns = new ActionRowBuilder();
        for(i=0;i<buttons.length;i++) {
            btns.addComponents(new ButtonBuilder().setLabel(buttons[i].toUpperCase()).setCustomId(buttons[i]).setStyle(ButtonStyle.Danger));
        }
        return btns;
    }
}