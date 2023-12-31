//Import du créateur de webhook
const { WebhookClient } = require('discord.js');
const webhookClient = new WebhookClient({ url: process.env.IRIS_DEBUG_LOGS_WEBHOOK_URL });

//Récup du créateur d'embed
const emb = require('./embeds');

//Récupération de la date au démarrage
const logDate = new Date();
var logMonth = (logDate.getUTCMonth() + 1);
var logDay = (logDate.getDate());
//Format de la date
if(logMonth.toString().length == 1) { logMonth = '0' + logMonth; }
if(logDay.toString().length == 1) { logDay = '0' + logDay; }
const logFormat = logDate.getUTCFullYear() + '-' + logMonth + '-' + logDay;
//Logger init
const log4js = require('log4js');
log4js.configure({
    appenders: { cheese: { type: 'file', filename: 'logs/' + logFormat + '-Iris' + '.log'}, console: { type: 'console'} },
    categories: { default: { appenders: ['cheese', 'console'], level: 'all' } }
});
const logger = log4js.getLogger();
logger.level = 'all';

module.exports = {
    log: async (log) => {
        logger.log(log);
        const embed = emb.generate(null, null, log, `#159879`, process.env.LSMS_LOGO_V2, null, `LOG`, null, null, null, null, true);
        await webhookClient.send({ embeds: [embed] });
    },
    logRadio: async (radio, freq) => {
        logger.log(`Régénération aléatoire de la radio "${radio}", fréquence: ${freq}`);
        const embed = emb.generate(null, null, `Régénération aléatoire de la radio`, `#159879`, getIcon(radio), null, `LOG`, null, null, null, null, true);
        embed.addFields({ name: '**Radio**', value: radio, inline: true }, { name: '**Fréquence**', value: freq });
        await webhookClient.send({ embeds: [embed] });
    },
    debug: async (debug) => {
        logger.debug(debug);
        try {
            const embed = emb.generate(null, null, debug, `#1688CD`, process.env.LSMS_LOGO_V2, null, `DEBUG`, null, null, null, null, true);
            await webhookClient.send({ embeds: [embed] });
        } catch (err) {
            try {
                debug = JSON.stringify(debug);
            } catch (err2) {
            }
            if(debug instanceof String && !debug.includes('https://')) {
                try {
                    const embed = emb.generate(null, null, debug, `#1688CD`, process.env.LSMS_LOGO_V2, null, `DEBUG`, null, null, null, null, true);
                    await webhookClient.send({ embeds: [embed] });
                } catch (err2) {
                    try {
                        await webhookClient.send({ content: '**DEBUG:**\n```\n' + debug + '\n```' });
                    } catch (err3) {
                        logger.error(err3);
                    }
                }
            } else {
                try {
                    await webhookClient.send({ content: '**DEBUG:**\n```\n' + debug + '\n```' });
                } catch (err2) {
                    logger.error(err2);
                }
            }
        }
    },
    warn: async (warn) => {
        logger.warn(warn);
        const embed = emb.generate(null, null, warn, `#FFD800`, process.env.LSMS_LOGO_V2, null, `WARN`, null, null, null, null, true);
        await webhookClient.send({ embeds: [embed] });
    },
    error: async (error) => {
        logger.error(error);
        try {
            const embed = emb.generate(null, null, error, `#1688CD`, process.env.LSMS_LOGO_V2, null, `ERROR`, null, null, null, null, true);
            await webhookClient.send({ embeds: [embed] });
        } catch (err) {
            try {
                error = JSON.stringify(error);
            } catch (err2) {
            }
            if(error instanceof String && !error.includes('https://')) {
                try {
                    const embed = emb.generate(null, null, error, `#1688CD`, process.env.LSMS_LOGO_V2, null, `ERROR`, null, null, null, null, true);
                    await webhookClient.send({ embeds: [embed] });
                } catch (err2) {
                    try {
                        await webhookClient.send({ content: '**ERROR:**\n```\n' + error + '\n```' });
                    } catch (err3) {
                        logger.error(err3);
                    }
                }
            } else {
                try {
                    await webhookClient.send({ content: '**ERROR:**\n```\n' + error + '\n```' });
                } catch (err2) {
                    logger.error(err2);
                }
            }
        }
    },
    getStartDate: () => {
        return logDate;
    }
}

function getIcon(radio) {
    switch(radio) {
        case 'Event':
            return 'https://cdn.discordapp.com/attachments/1132323171471736915/1142451759663566939/2021_Snowsgiving_Emojis_001_Icons_copy_2.png';
        default:
            return 'https://cdn.discordapp.com/attachments/1132323171471736915/1133027019131719861/Iris_LSMS.png';
    }
}