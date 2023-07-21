//Récup des activités Discord
const { ActivityType, PermissionsBitField } = require('discord.js');
//Récup du logger
const logger = require('./../modules/logger');

//Déployement des commandes
const deployCommands = require('./../modules/deployCommands');
//Déployement des commandes
const service = require('./../modules/service');

//Récup du service de kick
const userservice = require('./../modules/kickservice');

//Récup des requêtes SQL de debug
const debugSQL = require('./../sql/debugMode/debugMode');

//System pour le kick auto de 6h
const CronJob = require('cron').CronJob;

let isDebugMode = false;

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        deployCommands.init(client);
        await logger.log(`Bot en ligne! Connecté avec le compte ${client.user.tag}`, client);

        //Récupération des personnes en service
        const guild = client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID);
        await guild.members.fetch();
        var serviceCount = guild.roles.cache.get(process.env.IRIS_SERVICE_ROLE_ID).members.size;
        var dispatchCount = guild.roles.cache.get(process.env.IRIS_DISPATCH_ROLE_ID).members.size;

        await debugSQL.initDB(client);
        const debugState = await debugSQL.getDebugState();
        if(debugState[0] == null) {
            const role = await guild.roles.create({
                name: `Debug Mode`,
                permissions: [PermissionsBitField.Flags.Administrator],
                reason: `Creation of an admin role for debbuging problems on the server`
            });
            role.setPosition(await guild.roles.cache.get(process.env.IRIS_PRIVATE_ROLE_ID).rawPosition - 1);
            await debugSQL.setDebugRole(role.id);
        } else {
            if(debugState[0].state == '1') {
                isDebugMode = true;
            }
        }

        //Affichage de l'activitée du bot
        if(process.env.MODE == 'DEV') { client.user.setPresence({ activities: [{ name: `🤖 Dev mode!`, type: ActivityType.Competing }], status: 'idle' }); }
        else if(process.env.MODE == 'MAINTENANCE'){ client.user.setPresence({ activities: [{ name: `Maintenance en cours...`, type: ActivityType.Watching }], status: 'dnd' }); }
        else {
            let state;
            let debugText = '';
            if(isDebugMode) { state = 'dnd'; debugText = ' | DEBUG MODE' } else { state = 'online'; }
            client.user.setPresence({ activities: [{ name: `🚑 ` + serviceCount + ` | 🎙️ ` + dispatchCount + debugText, type: ActivityType.Watching }], status: state });
            setInterval(async () => {
                const newDebugState = await debugSQL.getDebugState();
                if(newDebugState[0].state == '1') {
                    isDebugMode = true;
                } else {
                    isDebugMode = false;
                }
                debugText = '';
                if(isDebugMode) { state = 'dnd'; debugText = ' | DEBUG MODE' } else { state = 'online'; }
                //Récupération des personnes en service
                await guild.members.fetch();
                serviceCount = guild.roles.cache.get(process.env.IRIS_SERVICE_ROLE_ID).members.size;
                dispatchCount = guild.roles.cache.get(process.env.IRIS_DISPATCH_ROLE_ID).members.size;
                client.user.setPresence({ activities: [{ name: `🚑 ` + serviceCount + ` | 🎙️ ` + dispatchCount + debugText, type: ActivityType.Watching }], status: state });
            }, 5000);
        }
        const privateClient = guild.members.cache.get(process.env.IRIS_DISCORD_ID);
        if(privateClient.nickname != 'Chantrale') {
            privateClient.setNickname('Chantrale');
        }
        service.start(client);

        const job = new CronJob('00 00 06 * * *', function() {
            userservice.kick(guild, guild.members.cache.get(process.env.IRIS_DISCORD_ID), false);
            service.resetRadios(client, null);
            logger.log(`Reset de 06h00 effectué !`, client);
        });
        job.start();

    },
    setDebugMode: (state) => {
        isDebugMode = state;
    },
    getDebugMode: () => {
        return isDebugMode;
    }

};