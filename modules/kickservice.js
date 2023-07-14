//Récup du systeme de logs RP
const logRP = require('./logsRP');

module.exports = {
    kick: (guild, forcer) => {
        const serviceRole = guild.roles.cache.get(process.env.IRIS_SERVICE_ROLE_ID);
        const dispatchRole = guild.roles.cache.get(process.env.IRIS_DISPATCH_ROLE_ID);
        const offole = guild.roles.cache.get(process.env.IRIS_OFF_ROLE_ID);
        const allMembers = serviceRole.members;
        allMembers.map(d => {
            d.roles.remove(serviceRole);
            logRP.fds(guild, d.nickname, forcer);
            if(d.roles.cache.has(process.env.IRIS_DISPATCH_ROLE_ID)) {
                logRP.fdd(guild, d.nickname, forcer);
            }
            d.roles.remove(dispatchRole);
            d.roles.remove(offole);
        });
    }
}