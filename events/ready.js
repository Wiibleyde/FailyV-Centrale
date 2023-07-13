//Récup des activités Discord
const { ActivityType } = require('discord.js');
//Récup du logger
const logger = require('./../modules/logger');

//Déployement des commandes
require('./../modules/deployCommands');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        await logger.log(`Bot en ligne! Connecté avec le compte ${client.user.tag}`);
        //Affichage de l'activitée du bot
        if(process.env.MODE == 'DEV') { client.user.setPresence({ activities: [{ name: `🤖 Dev mode!`, type: ActivityType.Competing }], status: 'idle' }); }
        else if(process.env.MODE == 'MAINTENANCE'){ client.user.setPresence({ activities: [{ name: `Maintenance en cours...`, type: ActivityType.Watching }], status: 'dnd' }); }
        else { client.user.setPresence({ activities: [{ name: `🚑 0 | 🎙️ 0`, type: ActivityType.Watching }], status: 'online' }); }
    },


};