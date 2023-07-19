//Récup des activités Discord
const { ActivityType } = require('discord.js');
//Récup du logger
const logger = require('./../modules/logger');

//Déployement des commandes
require('./../modules/deployCommands');
//Déployement des commandes
const service = require('./../modules/service');

//Récup du service de kick
const userservice = require('./../modules/kickservice');

//System pour le kick auto de 6h
const CronJob = require('cron').CronJob;

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        await logger.log(`Bot en ligne! Connecté avec le compte ${client.user.tag}`);
        //Récupération des personnes en service
        const guild = client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID);
        await guild.members.fetch();
        var serviceCount = guild.roles.cache.get(process.env.IRIS_SERVICE_ROLE_ID).members.size;
        var dispatchCount = guild.roles.cache.get(process.env.IRIS_DISPATCH_ROLE_ID).members.size;
        //Affichage de l'activitée du bot
        if(process.env.MODE == 'DEV') { client.user.setPresence({ activities: [{ name: `🤖 Dev mode!`, type: ActivityType.Competing }], status: 'idle' }); }
        else if(process.env.MODE == 'MAINTENANCE'){ client.user.setPresence({ activities: [{ name: `Maintenance en cours...`, type: ActivityType.Watching }], status: 'dnd' }); }
        else {
            client.user.setPresence({ activities: [{ name: `🚑 ` + serviceCount + ` | 🎙️ ` + dispatchCount, type: ActivityType.Watching }], status: 'online' });
            setInterval(async () => {
                //Récupération des personnes en service
                await guild.members.fetch();
                serviceCount = guild.roles.cache.get(process.env.IRIS_SERVICE_ROLE_ID).members.size;
                dispatchCount = guild.roles.cache.get(process.env.IRIS_DISPATCH_ROLE_ID).members.size;
                client.user.setPresence({ activities: [{ name: `🚑 ` + serviceCount + ` | 🎙️ ` + dispatchCount, type: ActivityType.Watching }], status: 'online' });
            }, 5000);
        }
        const privateClient = guild.members.cache.get(process.env.IRIS_DISCORD_ID);
        if(privateClient.nickname != 'Chantrale') {
            privateClient.setNickname('Chantrale');
        }
        service.start(client);

        const job = new CronJob('00 00 06 * * *', function() {
            userservice.kick(guild, guild.members.cache.get(process.env.IRIS_DISCORD_ID));
            service.resetRadios(client, null);
            logger.log(`Reboot de 06h00 effectué !`);
        });
        job.start();
        logger.send(client, `Status`, `Démarrage effectué avec succès !`, `#0DE600`);

    },

};