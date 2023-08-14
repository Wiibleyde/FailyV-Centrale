//Récup de fonctions pour envoyer les commandes slash sur Discord
const { REST, Routes } = require('discord.js');
//Récup du logger
const logger = require('./logger');
//Récup de fonctions node pour accéder aux fichiers
const fs = require('node:fs');
const path = require('node:path');
//Récup de la connection SQL
const mysql = require('./sql');

module.exports = {
    init: async (client) => {
        //Init de arrays pour stocker les commandes en fonction de où elles doivent être envoyés
        const publicCommands = [];
        const privateCommands = [];
        const devCommands = [];
        let isDevServerSameAsProd = false;
        if(process.env.IRIS_PRIVATE_GUILD_ID == process.env.IRIS_DEBUG_GUILD_ID) {
            isDevServerSameAsProd = true;
        }
        //Récup du chemin des fichiers de commandes
        const foldersPath = path.join(__dirname, '../commands');
        const commandsFolders = fs.readdirSync(foldersPath);
        
        //Stockage des commandes dans les différentes arrays
        for(const folder of commandsFolders) {
            if(folder == 'private') {
                const commandsPath = path.join(foldersPath, folder);
                const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
                for(const file of commandFiles) {
                    const filePath = path.join(commandsPath, file);
                    const command = require(filePath);
                    await initCommandStatColumn(command.data.name);
                    await initCommandStatRow(command.data.name);
                    if('data' in command && 'execute' in command) {
                        privateCommands.push(command.data.toJSON());
                    } else {
                        logger.warn(`La commande ${filePath} n'a pas la partie "data" ou "execute" !`);
                    }
                }
            }
            if(folder == 'dev') {
                const commandsPath = path.join(foldersPath, folder);
                const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
                for(const file of commandFiles) {
                    const filePath = path.join(commandsPath, file);
                    const command = require(filePath);
                    await initCommandStatColumn(command.data.name);
                    await initCommandStatRow(command.data.name);
                    if('data' in command && 'execute' in command) {
                        if(isDevServerSameAsProd) {
                            privateCommands.push(command.data.toJSON());
                        } else {
                            devCommands.push(command.data.toJSON());
                        }
                    } else {
                        logger.warn(`La commande ${filePath} n'a pas la partie "data" ou "execute" !`);
                    }
                }
            }
            if(folder == 'global') {
                const commandsPath = path.join(foldersPath, folder);
                const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
                for(const file of commandFiles) {
                    const filePath = path.join(commandsPath, file);
                    const command = require(filePath);
                    await initCommandStatColumn(command.data.name);
                    await initCommandStatRow(command.data.name);
                    if('data' in command && 'execute' in command) {
                        publicCommands.push(command.data.toJSON());
                    } else {
                        logger.warn(`La commande ${filePath} n'a pas la partie "data" ou "execute" !`);
                    }
                }
            }
        }
        
        const rest = new REST().setToken(process.env.IRIS_DISCORD_TOKEN);
        
        (async () => {
            try {
                let devData = 0;
                logger.log(`Rechargement de ${privateCommands.length} commandes slash (/) privées.`);
                logger.log(`Rechargement de ${publicCommands.length} commandes slash (/) publiques.`);
                if(!isDevServerSameAsProd) {
                    logger.log(`Rechargement de ${devCommands.length} commandes slash (/) de dev.`);
                    devData = await rest.put(Routes.applicationGuildCommands(process.env.IRIS_DISCORD_ID, process.env.IRIS_DEBUG_GUILD_ID), { body: devCommands });
                }
                //Envois des commandes sur un serveur spécifique
                const privateData = await rest.put(Routes.applicationGuildCommands(process.env.IRIS_DISCORD_ID, process.env.IRIS_PRIVATE_GUILD_ID), { body: privateCommands });
                //Envois des commandes globalement
                const publicData = await rest.put(Routes.applicationCommands(process.env.IRIS_DISCORD_ID), { body: publicCommands });
                logger.log(`Rechargement de ${privateData.length + publicData.length + devData.length} commandes slash (/) réussies.`);
            } catch (error) {
                logger.error(error);
            }
        })();
    }
}

function initCommandStatColumn(command) {
    return new Promise(async (resolve, reject) => {
        mysql.sql().query({
                sql: "SELECT `" + command + "` FROM `user_statistic`",
                timeout: 40000
            }, (reqErr, result, fields) => {
            if(reqErr) {
                mysql.sql().query({
                        sql: "ALTER TABLE `user_statistic` ADD (`" + command + "` VARCHAR(255) NOT NULL DEFAULT '0')",
                        timeout: 40000
                    }, (reqErr2, result2, fields) => {
                    if(reqErr2) {
                        logger.error(reqErr2);
                    }
                    resolve(result2);
                });
            }
            resolve(result);
        });
    });
}

async function initCommandStatRow(command) {
    const commandRow = await getCommandRow(command);
    if(commandRow[0] == null) {
        mysql.sql().query({
                sql: "INSERT INTO `command_statistic` SET `command_name`=?, `used`=?",
                timeout: 40000,
                values: [command, 0]
            }, (reqErr, result, fields) => {
            if(reqErr) {
                logger.error(reqErr);
            }
        });
    }
}

function getCommandRow(command) {
    return new Promise(async (resolve, reject) => {
        mysql.sql().query({
                sql: "SELECT * FROM `command_statistic` WHERE `command_name`=?",
                timeout: 40000,
                values: [command]
            }, (reqErr, result, fields) => {
            if(reqErr) {
                logger.error(reqErr);
                reject(reqErr);
            }
            resolve(result);
        });
    });
}