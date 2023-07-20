//Récup du systeme de logs RP
const logRP = require('./logsRP');
//Récup du créateur d'embed
const emb = require('./embeds');

module.exports = {
    kick: (guild, forcer, isGlobal) => {
        const serviceRole = guild.roles.cache.get(process.env.IRIS_SERVICE_ROLE_ID);
        const dispatchRole = guild.roles.cache.get(process.env.IRIS_DISPATCH_ROLE_ID);
        const offole = guild.roles.cache.get(process.env.IRIS_OFF_ROLE_ID);
        const allMembers = serviceRole.members;
        allMembers.map(async d => {
            const user = guild.members.cache.get(d.id);
            d.roles.remove(serviceRole);
            logRP.fds(guild, d.nickname, forcer.nickname);
            if(d.roles.cache.has(process.env.IRIS_DISPATCH_ROLE_ID)) {
                logRP.fdd(guild, d.nickname, forcer.nickname);
            }
            d.roles.remove(dispatchRole);
            d.roles.remove(offole);
            if(!isGlobal) {
                try {
                    let footerText = `Cordialement, `;
                    if(forcer.id == process.env.IRIS_DISCORD_ID) {
                        footerText = footerText + `votre secrétaire ${forcer.nickname}`;
                    } else {
                        footerText = footerText + forcer.nickname;
                    }
                    await user.send({ embeds: [emb.generate(`Bonjour, ${d.nickname}`, null, `Vous n'avez pas pris votre fin de service.\nMerci de penser à la prendre à l'avenir !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, `Gestion du service`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${guild.icon}.webp`, null, footerText, null, true)] });
                } catch(err) {
                }
            }
        });
    }
}