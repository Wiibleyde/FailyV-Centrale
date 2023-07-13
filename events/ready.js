//Récup des activités Discord
const { ActivityType } = require('discord.js');
//Récup du logger
const logger = require('./../modules/logger');

//Déployement des commandes
require('./../modules/deployCommands');
//Déployement des commandes
const service = require('./../modules/service');
//Démarrage de la cooldown de service
const serviceCooldown = require('./../modules/serviceCooldown');


module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        await logger.log(`Bot en ligne! Connecté avec le compte ${client.user.tag}`);
        //Récupération des personnes en service
        const guild = client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID);
        await guild.members.fetch();
        const countPDS = guild.roles.cache.get(process.env.IRIS_SERVICE_ROLE_ID).members;
        var serviceCount = countPDS.size;
        const countDispatch = guild.roles.cache.get(process.env.IRIS_DISPATCH_ROLE_ID).members;
        var dispatchCount = countDispatch.size;
        //Affichage de l'activitée du bot
        if(process.env.MODE == 'DEV') { client.user.setPresence({ activities: [{ name: `🤖 Dev mode!`, type: ActivityType.Competing }], status: 'idle' }); }
        else if(process.env.MODE == 'MAINTENANCE'){ client.user.setPresence({ activities: [{ name: `Maintenance en cours...`, type: ActivityType.Watching }], status: 'dnd' }); }
        else { client.user.setPresence({ activities: [{ name: `🚑 ` + serviceCount + ` | 🎙️ ` + dispatchCount, type: ActivityType.Watching }], status: 'online' }); }
        service.start(client);
        serviceCooldown.init();
    },

};