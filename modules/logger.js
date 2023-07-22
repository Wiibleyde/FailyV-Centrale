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
    log: (log) => {
        return new Promise((resolve, reject) => {
            logger.log(log);
            const embed = emb.generate(null, null, log, `#159879`, process.env.LSMS_LOGO_V2, null, `LOG`, null, null, null, null, true);
            webhookClient.send({ embeds: [embed] });
        });
    },
    debug: (debug) => {
        return new Promise((resolve, reject) => {
            logger.debug(debug);
            try {
                const embed = emb.generate(null, null, debug, `#1688CD`, process.env.LSMS_LOGO_V2, null, `DEBUG`, null, null, null, null, true);
                webhookClient.send({ embeds: [embed] });
            } catch (err) {
                debug = JSON.stringify(debug);
                if(!debug.includes('https://')) {
                    try {
                        const embed = emb.generate(null, null, debug, `#1688CD`, process.env.LSMS_LOGO_V2, null, `DEBUG`, null, null, null, null, true);
                        webhookClient.send({ embeds: [embed] });
                    } catch (err2) {
                        try {
                            webhookClient.send({ content: '**DEBUG:**\n```\n' + debug + '\n```' });
                        } catch (err3) {
                            logger.error(err3);
                        }
                    }
                } else {
                    try {
                        webhookClient.send({ content: '**DEBUG:**\n```\n' + debug + '\n```' });
                    } catch (err2) {
                        logger.error(err2);
                    }
                }
            }
        });
    },
    warn: (warn) => {
        return new Promise((resolve, reject) => {
            logger.warn(warn);
            const embed = emb.generate(null, null, warn, `#FFD800`, process.env.LSMS_LOGO_V2, null, `WARN`, null, null, null, null, true);
            webhookClient.send({ embeds: [embed] });
        });
    },
    error: (error) => {
        return new Promise((resolve, reject) => {
            logger.error(error);
            const embed = emb.generate(null, null, error, `#FF0000`, process.env.LSMS_LOGO_V2, null, `ERROR`, null, null, null, null, true);
            webhookClient.send({ embeds: [embed] });
        });
    },
    getStartDate: () => {
        return logDate;
    }
}