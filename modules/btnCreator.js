//Récupération des fonctions pour créer des boutons
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
//Récup du logger
const logger = require('./logger');

module.exports = {
    genBedsBtns: async (buttons) => {
        logger.debug('Starting beds buttons creation');
        const btns = new ActionRowBuilder();
        for(i=0;i<buttons.length;i++) {
            logger.debug(`Created "${buttons[i].toUpperCase()}" button`);
            btns.addComponents(new ButtonBuilder().setLabel(buttons[i].toUpperCase()).setCustomId(buttons[i]).setStyle(ButtonStyle.Danger));
        }
        logger.debug(`End of creation`);
        return btns;
    }
}