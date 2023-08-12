/////////////////////////////////////////////////////////////////
// TEST DE COMMENTAIRE POUR CHECK SI LE PULL DE 06H FONCTIONNE //
/////////////////////////////////////////////////////////////////

//File reading
const fs = require('node:fs');
const path = require('node:path');

//.env Init
const dotenv = require('dotenv');
dotenv.config();

//SQL init
const sql = require('./sql/config/config');

//Read console init
const readline = require('readline');
const readcmd = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

//Récup du logger
const logger = require('./modules/logger');

//Discord init
const { Client, GatewayIntentBits, Collection, Events, WebhookClient } = require('discord.js');
const client = new Client({ intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildScheduledEvents ]});
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
    let IRIS_SERVICE_CHANNEL_ID = await sql.getChannel('IRIS_SERVICE_CHANNEL_ID');
    if (IRIS_SERVICE_CHANNEL_ID[0] == null) {
        IRIS_SERVICE_CHANNEL_ID = null;
    } else {
        IRIS_SERVICE_CHANNEL_ID = IRIS_SERVICE_CHANNEL_ID[0].id;
    }
    let IRIS_RADIO_CHANNEL_ID = await sql.getChannel('IRIS_RADIO_CHANNEL_ID');
    if (IRIS_RADIO_CHANNEL_ID[0] == null) {
        IRIS_RADIO_CHANNEL_ID = null;
    } else {
        IRIS_RADIO_CHANNEL_ID = IRIS_RADIO_CHANNEL_ID[0].id;
    }
    let IRIS_FOLLOW_CHANNEL_ID = await sql.getChannel('follow');
    if (IRIS_FOLLOW_CHANNEL_ID[0] == null) {
        IRIS_FOLLOW_CHANNEL_ID = null;
    } else {
        IRIS_FOLLOW_CHANNEL_ID = IRIS_FOLLOW_CHANNEL_ID[0].id;
    }
    let IRIS_FOLLOW_THREAD_PPA_ID = await sql.getChannel('follow_thread_ppa');
    if (IRIS_FOLLOW_THREAD_PPA_ID[0] == null) {
        IRIS_FOLLOW_THREAD_PPA_ID = null;
    } else {
        IRIS_FOLLOW_THREAD_PPA_ID = IRIS_FOLLOW_THREAD_PPA_ID[0].id;
    }
    let IRIS_FOLLOW_THREAD_SECOURS_ID = await sql.getChannel('follow_thread_secours');
    if (IRIS_FOLLOW_THREAD_SECOURS_ID[0] == null) {
        IRIS_FOLLOW_THREAD_SECOURS_ID = null;
    } else {
        IRIS_FOLLOW_THREAD_SECOURS_ID = IRIS_FOLLOW_THREAD_SECOURS_ID[0].id;
    }
    // if(message.channelId == IRIS_SERVICE_CHANNEL_ID || message.channelId == IRIS_RADIO_CHANNEL_ID || message.channelId == IRIS_FOLLOW_CHANNEL_ID) {
    if (message.channelId == IRIS_SERVICE_CHANNEL_ID || message.channelId == IRIS_RADIO_CHANNEL_ID || message.channelId == IRIS_FOLLOW_CHANNEL_ID || message.channelId == IRIS_FOLLOW_THREAD_PPA_ID || message.channelId == IRIS_FOLLOW_THREAD_SECOURS_ID) {
        if(message.author != process.env.IRIS_DISCORD_ID) {
            logger.warn(`${message.member.nickname} - ${message.author.username}#${message.author.discriminator} (<@${message.author.id}>)\n\nà envoyé un message dans le salon interdit "#${client.guilds.cache.get(message.guildId).channels.cache.get(message.channelId).name} <#${message.channelId}>"\n\nContenu: "${message.content}"`);
            await message.delete();
        }
    }
});

client.on(Events.GuildScheduledEventCreate, async (guildScheduledEvent) => {
    //Import du créateur de webhook
    logger.log(`Événement "**${guildScheduledEvent.name}**" créé`);
    const webhookClient = new WebhookClient({ url: process.env.IRIS_AGENDA_WEBHOOK_URL });
    webhookClient.send({ content: `https://discord.com/events/${guildScheduledEvent.guildId}/${guildScheduledEvent.id}` });
});

client.on(Events.GuildScheduledEventUpdate, async (guildScheduledEvent) => {
    //Récup des requêtes SQL
    const sqlAgenda = require('./sql/agenda/agenda');
    const agendaChannelId = await sqlAgenda.getAgendaChannelId();
    if(guildScheduledEvent.status == 1) {
        logger.log(`Événement "**${guildScheduledEvent.name}**" démarré`);
    }
    if(guildScheduledEvent.status == 2) {
        logger.log(`Événement "**${guildScheduledEvent.name}**" terminé`);
        guildScheduledEvent.guild.channels.cache.get(agendaChannelId[0].id).messages.fetch().then(m => { m.forEach(msg => { if(msg.content == `https://discord.com/events/${guildScheduledEvent.guildId}/${guildScheduledEvent.id}`) { msg.delete(); } }) });
        const isEventIsDelta = await sqlAgenda.getByURL(`https://discord.com/events/${guildScheduledEvent.guildId}/${guildScheduledEvent.id}`);
        if(isEventIsDelta[0] != null) {
            await sqlAgenda.updateToEndState(`https://discord.com/events/${guildScheduledEvent.guildId}/${guildScheduledEvent.id}`);
        }
    }
});

client.on(Events.GuildScheduledEventDelete, async (guildScheduledEvent) => {
    //Récup des requêtes SQL
    const sqlAgenda = require('./sql/agenda/agenda');
    const agendaChannelId = await sqlAgenda.getAgendaChannelId();
    logger.log(`Événement "**${guildScheduledEvent.name}**" supprimé`);
    guildScheduledEvent.guild.channels.cache.get(agendaChannelId[0].id).messages.fetch().then(m => { m.forEach(msg => { if(msg.content == `https://discord.com/events/${guildScheduledEvent.guildId}/${guildScheduledEvent.id}`) { msg.delete(); } }) });
    const isEventIsDelta = await sqlAgenda.getByURL(`https://discord.com/events/${guildScheduledEvent.guildId}/${guildScheduledEvent.id}`);
    if(isEventIsDelta[0] != null) {
        await sqlAgenda.updateToEndState(`https://discord.com/events/${guildScheduledEvent.guildId}/${guildScheduledEvent.id}`);
    }
});

client.on(Events.ClientReady, (client) => {
    //Récupération du module WebSocket
    const WebSocket = require("ws");
    //Connection au serveur de radio communes
    const ws = new WebSocket(`ws://${process.env.RADIO_SERVER_URL}`);
    //Requêtes SQL de radios
    const sqlRadio = require('./sql/radio/radios');
    //Fonction pour attendre
    const wait = require('node:timers/promises').setTimeout;
    
    ws.onmessage = async (wsData) => {
        let radioMessageId;
        try {
            radioMessageId = await sqlRadio.getRadioMessageId();
            radioMessageId = radioMessageId[0];
        } catch(err) {
            radioMessageId = null;
        }
        if(radioMessageId == null) {
            await wait(10000);
            updateRadios(client, ws, wsData, sqlRadio);
        } else {
            updateRadios(client, ws, wsData, sqlRadio);
        }
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

async function updateRadios(client, ws, wsData, sqlRadio) {
    //Récupération du module de création de JsonWebToken
    const jwt = require('jsonwebtoken');
    //Module de mise à jour des radios
    const radio = require('./modules/changeRadio');
    //Récup du service de kick
    const userservice = require('./modules/kickservice');
    //Déployement des commandes
    const service = require('./modules/service');

    try {
        const data = jwt.verify(wsData.data, process.env.RADIO_SERVER_JWT_SECRET);
        if (data.type === "refresh") {
            // On radio refresh
            if(data.radioName == 'lsms-lspd-lscs') {
                radio.change(client, 'regenFDO', data.radioFreq, true);
                await sqlRadio.setRadio('fdo', data.radioFreq);
            }
            if(data.radioName == 'lsms-bcms') {
                radio.change(client, 'regenBCMS', data.radioFreq, true);
                await sqlRadio.setRadio('bcms', data.radioFreq);
            }
        } else if(data.type === "auto_refresh") {
            if(data.radioName == 'lsms-lspd-lscs') {
                //Generation aléatoire de la radio entre 250.0 et 344.9
                const freqUnit = Math.floor(Math.random() * (344-250+1)) + 250;
                const freqDeci = Math.floor(Math.random() * 10);
                const freqLSMS = freqUnit + '.' + freqDeci;
                service.resetRadios(client, freqLSMS, data.radioFreq, null);
                const guild = client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID);
                userservice.kick(guild, guild.members.cache.get(process.env.IRIS_DISCORD_ID), false);

                //Remove doctors
                const doctor = require('./sql/doctorManagement/doctor');
                const doctorsToRemove = await doctor.getDoctorsToRemove();
                if(doctorsToRemove[0] != null) {
                    for(let i=0;i<doctorsToRemove.length;i++) {
                        const currentDate = new Date();
                        const departureDate = new Date(doctorsToRemove[i].departure_date);
                        const member = guild.members.cache.get(doctorsToRemove[i].discord_id);
                        let yearToCheck;
                        let monthToCheck = currentDate.getMonth();
                        if(departureDate.getMonth() == 11) {
                            monthToCheck = 0;
                        }
                        const thirtyDaysMonth = [3,5,8,10];
                        if(doctorsToRemove[i].discord_id != '461880599594926080' && doctorsToRemove[i].discord_id != '461807010086780930' && doctorsToRemove[i].discord_id != '368259650136571904') {
                            if(departureDate.getHours() >= 6 && departureDate.getHours() <= 23) {
                                if(currentDate.getDate() == 1 && departureDate.getDate() + 1 == 31 && currentDate.getMonth() == 0 && departureDate.getMonth() == 11 && currentDate.getFullYear() == departureDate.getFullYear() + 1) {
                                    try { await member.kick({ reason: `Ne fait plus partit de l'effectif du LSMS` }); } catch (err) {}
                                } else if(currentDate.getDate() == 1 && departureDate.getDate() + 1 == 31 && currentDate.getMonth() == departureDate.getMonth() + 1 && currentDate.getFullYear() == departureDate.getFullYear()) {
                                    try { await member.kick({ reason: `Ne fait plus partit de l'effectif du LSMS` }); } catch (err) {}
                                } else if(currentDate.getDate() == 1 && departureDate.getDate() + 1 == 29 && currentDate.getMonth() == 2 && departureDate.getMonth() == 1 && currentDate.getFullYear() == departureDate.getFullYear()) {
                                    try { await member.kick({ reason: `Ne fait plus partit de l'effectif du LSMS` }); } catch (err) {}
                                } else if(currentDate.getDate() == 1 && departureDate.getDate() + 1 == 28 && currentDate.getMonth() == 2 && departureDate.getMonth() == 1 && currentDate.getFullYear() == departureDate.getFullYear() && !isLeapYear(currentDate.getFullYear())) {
                                    try { await member.kick({ reason: `Ne fait plus partit de l'effectif du LSMS` }); } catch (err) {}
                                } else if(currentDate.getDate() == 1 && departureDate.getDate() + 1 == 30 && thirtyDaysMonth.contains(departureDate.getMonth()) && currentDate.getMonth() == departureDate.getMonth() + 1 && currentDate.getFullYear() == departureDate.getFullYear()) {
                                    try { await member.kick({ reason: `Ne fait plus partit de l'effectif du LSMS` }); } catch (err) {}
                                } else if(currentDate.getDate() > departureDate.getDate() + 1 && currentDate.getDate() < departureDate.getDate() + 3 && currentDate.getMonth() == departureDate.getMonth() && currentDate.getFullYear() == departureDate.getFullYear()) {
                                    try { await member.kick({ reason: `Ne fait plus partit de l'effectif du LSMS` }); } catch (err) {}
                                }
                            } else {
                                if(currentDate.getDate() == 1 && departureDate.getDate() + 2 == 31 && currentDate.getMonth() == 0 && departureDate.getMonth() == 11 && currentDate.getFullYear() == departureDate.getFullYear() + 1) {
                                    try { await member.kick({ reason: `Ne fait plus partit de l'effectif du LSMS` }); } catch (err) {}
                                } else if(currentDate.getDate() == 1 && departureDate.getDate() + 2 == 31 && currentDate.getMonth() == departureDate.getMonth() + 1 && currentDate.getFullYear() == departureDate.getFullYear()) {
                                    try { await member.kick({ reason: `Ne fait plus partit de l'effectif du LSMS` }); } catch (err) {}
                                } else if(currentDate.getDate() == 1 && departureDate.getDate() + 2 == 29 && currentDate.getMonth() == 2 && departureDate.getMonth() == 1 && currentDate.getFullYear() == departureDate.getFullYear()) {
                                    try { await member.kick({ reason: `Ne fait plus partit de l'effectif du LSMS` }); } catch (err) {}
                                } else if(currentDate.getDate() == 1 && departureDate.getDate() + 2 == 28 && currentDate.getMonth() == 2 && departureDate.getMonth() == 1 && currentDate.getFullYear() == departureDate.getFullYear() && !isLeapYear(currentDate.getFullYear())) {
                                    try { await member.kick({ reason: `Ne fait plus partit de l'effectif du LSMS` }); } catch (err) {}
                                } else if(currentDate.getDate() == 1 && departureDate.getDate() + 2 == 30 && thirtyDaysMonth.contains(departureDate.getMonth()) && currentDate.getMonth() == departureDate.getMonth() + 1 && currentDate.getFullYear() == departureDate.getFullYear()) {
                                    try { await member.kick({ reason: `Ne fait plus partit de l'effectif du LSMS` }); } catch (err) {}
                                } else if(currentDate.getDate() > departureDate.getDate() + 2 && currentDate.getDate() < departureDate.getDate() + 3 && currentDate.getMonth() == departureDate.getMonth() && currentDate.getFullYear() == departureDate.getFullYear()) {
                                    try { await member.kick({ reason: `Ne fait plus partit de l'effectif du LSMS` }); } catch (err) {}
                                }
                            }
                        }
                        let timeToRemove = false;
                        if(departureDate.getMonth() == 11 && currentDate.getMonth() == 0 && currentDate.getFullYear() == departureDate.getFullYear() + 1 && currentDate.getDate() == departureDate.getDate()) {
                            timeToRemove = true;
                        } else if(departureDate.getMonth() == 0 && currentDate.getMonth() == 1 && currentDate.getFullYear() == departureDate.getFullYear() && currentDate.getDate() == departureDate.getDate()) {
                            timeToRemove = true
                        } else if(currentDate.getFullYear() == departureDate.getFullYear()) {
                            if(departureDate.getMonth() == 0 && currentDate.getMonth() == 2 && departureDate.getDate() > 28 && currentDate.getDate() == 1) {
                                timeToRemove = true;
                            } else if(departureDate.getMonth() == 1 || departureDate.getMonth() == 3 || departureDate.getMonth() == 5 || departureDate.getMonth() == 8 || departureDate.getMonth() == 10) {
                                if(currentDate.getDate() == departureDate.getDate() + 1) { timeToRemove = true; }
                            } else { if(currentDate.getDate() == departureDate.getDate()) { timeToRemove = true; } }
                        }
                        if(timeToRemove) {
                            try {
                                await guild.channels.cache.get(doctorsToRemove[i].channel_id).delete();
                            } catch (err) {}
                            await doctor.setDeleted(doctorsToRemove[i].id);
                        }
                    }
                }

                logger.log(`Reset de 06h00 effectué !`);
            }
        } else if (data.type === "radio_info") {
            const wsModule = require('./modules/commonRadioServer');
            // On connection and specific radio asking
            if(data.radioName == 'lsms-lspd-lscs') {
                radio.change(client, 'regenFDO', data.radioFreq, false);
                await sqlRadio.setRadio('fdo', data.radioFreq);
            }
            if(data.radioName == 'lsms-bcms') {
                const isBCMSDisplayed = await sqlRadio.isRadioDisplayed('bcms');
                if(isBCMSDisplayed[0].displayed == '1') {
                    radio.change(client, 'regenBCMS', data.radioFreq, false);
                }
                await sqlRadio.setRadio('bcms', data.radioFreq);
            }
        } else if(data.type === "error") {
            // If an error is returned
            logger.error(data);
        }
    } catch {}
}

function isLeapYear(year) {
    if ((0 == year % 4) && (0 != year % 100) || (0 == year % 400)) {
        return true;
    } else {
        return false;
    }
}