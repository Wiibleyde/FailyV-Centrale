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
    log: function(log) {
        logger.log(log);
    },
    debug: function(debug) {
        logger.debug(debug);
    },
    warn: function(warn) {
        logger.warn(warn);
    },
    error: function(error) {
        logger.error(error);
    },
    getStartDate: function() {
        return logDate;
    }
}