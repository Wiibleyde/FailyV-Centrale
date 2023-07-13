//Récup de fonctions pour envoyer les commandes slash sur Discord
const { REST, Routes } = require('discord.js');
//Récup du logger
const logger = require('./logger');
//Récup de fonctions node pour accéder aux fichiers
const fs = require('node:fs');
const path = require('node:path');

//Init de arrays pour stocker les commandes en fonction de où elles doivent être envoyés
const publicCommands = [];
const privateCommands = [];
const debugCommands = [];
//Récup du chemin des fichiers de commandes
const foldersPath = path.join(__dirname, '../commands');
const commandsFolders = fs.readdirSync(foldersPath);

//Stockage des commandes dans les différentes arrays
for(const folder of commandsFolders) {
    if(folder == 'test') {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        for(const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            if('data' in command && 'execute' in command) {
                debugCommands.push(command.data.toJSON());
            } else {
                logger.warn(`La commande ${filePath} n'a pas la partie "data" ou "execute" !`);
            }
        }
    } else if(folder == 'private') {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        for(const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            if('data' in command && 'execute' in command) {
                privateCommands.push(command.data.toJSON());
            } else {
                logger.warn(`La commande ${filePath} n'a pas la partie "data" ou "execute" !`);
            }
        }
    } else {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        for(const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
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
		logger.log(`Rechargement de ${debugCommands.length} commandes slash (/) de dev.`);
		logger.log(`Rechargement de ${privateCommands.length} commandes slash (/) privées.`);
		logger.log(`Rechargement de ${publicCommands.length} commandes slash (/) publiques.`);
        //Envois des commandes sur un serveur spécifique
		const privateData = await rest.put(Routes.applicationGuildCommands(process.env.IRIS_DISCORD_ID, process.env.IRIS_PRIVATE_GUILD_ID), { body: privateCommands });
        //Envois des commandes sur le serveur de dev
		const debugData = await rest.put(Routes.applicationGuildCommands(process.env.IRIS_DISCORD_ID, process.env.IRIS_DEBUG_GUILD_ID), { body: debugCommands });
        //Envois des commandes globalement
		const publicData = await rest.put(Routes.applicationCommands(process.env.IRIS_DISCORD_ID), { body: publicCommands });
		logger.log(`Rechargement de ${privateData.length + publicData.length + debugData.length} commandes slash (/) réussies.`);
	} catch (error) {
		logger.error(error);
	}
})();