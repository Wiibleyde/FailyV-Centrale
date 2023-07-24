//File reading
const fs = require('node:fs');
const path = require('node:path');

//.env Init
const dotenv = require('dotenv');
dotenv.config();

//Read console init
const readline = require('readline');
const readcmd = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

//Récup du logger
const logger = require('./modules/logger');

//Récup des requêtes SQL du nom
const sql = require('./sql/init/initAllTables');
initAllSqlTable();

//Discord init
const { Client, GatewayIntentBits, Collection, Events } = require('discord.js');
const client = new Client({ intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent ]});
//Init des commandes Discord
client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandsFolders = fs.readdirSync(foldersPath);

for(const folder of commandsFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for(const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            logger.warn(`La commande ${filePath} n'a pas la partie "data" ou "execute" !`);
        }
    }
}

//Init des events Discord
client.on(Events.MessageCreate, async (message) => {
    if(message.channelId == process.env.IRIS_SERVICE_CHANNEL_ID || message.channelId == process.env.IRIS_RADIO_CHANNEL_ID) {
        if(message.author != process.env.IRIS_DISCORD_ID) {
            logger.warn(`${message.member.nickname} - ${message.author.username}#${message.author.discriminator} (<@${message.author.id}>)\n\nà envoyé un message dans le salon interdit "#${client.guilds.cache.get(message.guildId).channels.cache.get(message.channelId).name} <#${message.channelId}>"\n\nContenu: "${message.content}"`);
            await message.delete();
        }
    }
});

client.on(Events.ClientReady, (client) => {
    //Récupération du module WebSocket
    const WebSocket = require("ws");
    //Récupération du module de création de JsonWebToken
    const jwt = require('jsonwebtoken');
    //Connection au serveur de radio communes
    const ws = new WebSocket(`ws://${process.env.RADIO_SERVER_URL}`);
    //Module de mise à jour des radios
    const radio = require('./modules/changeRadio');
    //Requêtes SQL de radios
    const sqlRadio = require('./sql/radio/radios');
    
    ws.onmessage = async (wsData) => {
        try {
            const data = jwt.verify(wsData.data, process.env.RADIO_SERVER_JWT_SECRET);
            if (data.type === "refresh" || data.type === "auto_refresh") {
                let needPing = true;
                if(data.type === "auto_refresh") { needPing = false; }
                // On radio refresh
                if(data.radioName == 'lsms-lspd') {
                    radio.change(client, 'regenFDO', data.radioFreq, needPing);
                }
                if(data.radioName == 'lsms-bcms') {
                    if(needPing) {
                        radio.change(client, 'regenBCMS', data.radioFreq, true);
                    }
                }
            } else if (data.type === "radio_info") {
                // On connection and specific radio asking
                if(data.radioName == 'lsms-lspd') {
                    radio.change(client, 'regenFDO', data.radioFreq, false);
                }
                if(data.radioName == 'lsms-bcms') {
                    const isBCMSDisplayed = await sqlRadio.isRadioDisplayed('bcms');
                    if(isBCMSDisplayed[0].displayed == '1') {
                        radio.change(client, 'regenBCMS', data.radioFreq, false);
                    }
                }
            } else if(data.type === "error") {
                // If an error is returned
                logger.error(data);
            }
        } catch {}
    }
});

const eventsPath = path.join(__dirname, 'events');
const eventsFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for(const file of eventsFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if(event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

//Mise en ligne du bot sur Discord
client.login(process.env.IRIS_DISCORD_TOKEN);

//Arrêt lors d'une commande console
readcmd.on('line', async (input) => {
    if(input.toLowerCase() == 'quit') {
        logger.log(`Au revoir! ${client.user.tag} hors-ligne`);
        await client.destroy();
        process.exit(0);
    }
});

//Arrêt avec forever (utilisé sur le serveur de prod)
process.on('SIGTERM', async () => {
    logger.log(`Au revoir! ${client.user.tag} hors-ligne`);
    await client.destroy();
    process.exit(0);
});

async function initAllSqlTable() {
    return await sql.initAllTables();
}