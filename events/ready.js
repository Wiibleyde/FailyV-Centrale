//Récup des activités Discord
const { ActivityType, PermissionsBitField } = require('discord.js');
//Récup du logger
const logger = require('./../modules/logger');

//Déployement des commandes
const deployCommands = require('./../modules/deployCommands');
//Déployement des commandes
const service = require('./../modules/service');

//Récup des requêtes SQL de debug
const debugSQL = require('./../sql/debugMode/debugMode');

//Récup des requêtes SQL du nom
const nameSQL = require('./../sql/rename/rename');

//System pour le kick auto de 6h
const CronJob = require('cron').CronJob;

//Fonction pour attendre
const wait = require('node:timers/promises').setTimeout;

//Récup des requêtes SQL du nom
const sql = require('./../sql/init/initAllTables');

let isDebugMode = false;

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        await sql.initAllTables();
        deployCommands.init(client);
        logger.log(`Bot en ligne! Connecté avec le compte ${client.user.tag}`);

        //Récupération des personnes en service
        const guild = client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID);
        await guild.members.fetch();
        var serviceCount = guild.roles.cache.get(process.env.IRIS_SERVICE_ROLE_ID).members.size;
        var dispatchCount = guild.roles.cache.get(process.env.IRIS_DISPATCH_ROLE_ID).members.size;

        const debugState = await debugSQL.getDebugState();
        if(debugState[0] == null) {
            const role = await guild.roles.create({
                name: `Debug Mode`,
                permissions: [PermissionsBitField.Flags.Administrator],
                reason: `Creation of an admin role for debbuging problems on the server`
            });
            const irisRolePos = await guild.roles.cache.get(process.env.IRIS_PRIVATE_ROLE_ID);
            role.setPosition(irisRolePos.rawPosition - 1);
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
                serviceCount = guild.roles.cache.get(process.env.IRIS_SERVICE_ROLE_ID).members.size;
                dispatchCount = guild.roles.cache.get(process.env.IRIS_DISPATCH_ROLE_ID).members.size;
                client.user.setPresence({ activities: [{ name: `🚑 ` + serviceCount + ` | 🎙️ ` + dispatchCount + debugText, type: ActivityType.Watching }], status: state });
            }, 5000);
        }
        const privateClient = guild.members.cache.get(process.env.IRIS_DISCORD_ID);
        const customName = await nameSQL.getName();
        if(customName[0] != null) {
            if(privateClient.nickname != customName[0].name) {
                privateClient.setNickname(customName[0].name);
            }
        } else {
            privateClient.setNickname('');
        }
        service.start(client);

        const update = new CronJob('00 55 05 * * *', async function() {
            const { exec } = require('node:child_process');
            exec('git pull && npm i', async (err, output) => {
                if(err) return await logger.error(err);
                await logger.debug(output);
            });
            await wait(30000);
            await logger.log(`Redémarrage dans **30s** pour la MAJ du jour !`);
            await wait(30000);
            await client.destroy();
            process.exit(1);
        });
        update.start();

    },
    setDebugMode: (state) => {
        isDebugMode = state;
    },
    getDebugMode: () => {
        return isDebugMode;
    }

};