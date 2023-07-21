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
        logger.log(log, client);
        if(client != null) {
            const embed = emb.generate(null, null, log, `#13B154`, process.env.LSMS_LOGO_V2, null, `LOG`, client.user.avatarURL(), null, null, null, true);
            await client.guilds.cache.get(process.env.IRIS_DEBUG_GUILD_ID).channels.cache.get(process.env.IRIS_DEBUG_LOGS_CHANNEL_ID).send({ embeds: [embed] });
        }
    },
    debug: async (debug, client) => {
        logger.debug(debug);
        if(client != null) {
            const embed = emb.generate(null, null, log, `#43CCB0`, process.env.LSMS_LOGO_V2, null, `DEBUG`, client.user.avatarURL(), null, null, null, true);
            await client.guilds.cache.get(process.env.IRIS_DEBUG_GUILD_ID).channels.cache.get(process.env.IRIS_DEBUG_LOGS_CHANNEL_ID).send({ embeds: [embed] });
        }
    },
    warn: async (warn, client) => {
        logger.warn(warn);
        if(client != null) {
            const embed = emb.generate(null, null, log, `Gold`, process.env.LSMS_LOGO_V2, null, `WARN`, client.user.avatarURL(), null, null, null, true);
            await client.guilds.cache.get(process.env.IRIS_DEBUG_GUILD_ID).channels.cache.get(process.env.IRIS_DEBUG_LOGS_CHANNEL_ID).send({ embeds: [embed] });
        }
    },
    error: async (error) => {
        logger.error(error);
    },
    getStartDate: () => {
        return logDate;
    }
}