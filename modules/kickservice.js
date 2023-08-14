//Récup du systeme de logs RP
const logRP = require('./logsRP');
//Récup du créateur d'embed
const emb = require('./embeds');
const logger = require('./logger');

module.exports = {
    kick: (guild, forcer, isGlobal) => {
        return new Promise((resolve, reject) => {
            const serviceRole = guild.roles.cache.get(process.env.IRIS_SERVICE_ROLE_ID);
            const dispatchRole = guild.roles.cache.get(process.env.IRIS_DISPATCH_ROLE_ID);
            const offole = guild.roles.cache.get(process.env.IRIS_OFF_ROLE_ID);
            const allMembers = serviceRole.members;
            let forcerNickname = forcer.nickname;
            if(forcerNickname == null) {
                forcerNickname = forcer.user.username;
            }
            allMembers.map(async d => {
                const user = guild.members.cache.get(d.id);
                await d.roles.remove(serviceRole);
                await logRP.fds(guild, d.nickname, forcerNickname);
                if(d.roles.cache.has(process.env.IRIS_DISPATCH_ROLE_ID)) {
                    await logRP.fdd(guild, d.nickname, forcerNickname);
                }
                await d.roles.remove(dispatchRole);
                await d.roles.remove(offole);
                if(!isGlobal) {
                    try {
                        let footerText = `Cordialement, `;
                        if(forcer.id == process.env.IRIS_DISCORD_ID) {
                            footerText = footerText + `votre secrétaire ${forcerNickname}`;
                        } else {
                            footerText = footerText + forcerNickname;
                        }
                        await user.send({ embeds: [emb.generate(`Bonjour, ${d.nickname}`, null, `Vous n'avez pas pris votre fin de service.\nMerci d'y penser à l'avenir !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, `Gestion du service`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${guild.icon}.webp`, null, footerText, null, true)] });
                    } catch(err) {}
                }
            });
            resolve('Ok!');
        });
    },
    kickSomeone: (member, guild, forcer, needDM) => {
        return new Promise(async (resolve, reject) => {
            const serviceRole = guild.roles.cache.get(process.env.IRIS_SERVICE_ROLE_ID);
            const dispatchRole = guild.roles.cache.get(process.env.IRIS_DISPATCH_ROLE_ID);
            const offole = guild.roles.cache.get(process.env.IRIS_OFF_ROLE_ID);
            let forcerNickname = forcer.nickname;
            if(forcerNickname == null) {
                forcerNickname = forcer.user.username;
            }
            await member.roles.remove(serviceRole);
            logRP.fds(guild, member.nickname, forcerNickname);
            if(member.roles.cache.has(process.env.IRIS_DISPATCH_ROLE_ID)) {
                await logRP.fdd(guild, member.nickname, forcerNickname);
            }
            await member.roles.remove(dispatchRole);
            await member.roles.remove(offole);
            if(needDM) {
                try {
                    let footerText = `Cordialement, `;
                    if(forcer.id == process.env.IRIS_DISCORD_ID) {
                        footerText = footerText + `votre secrétaire ${forcerNickname}`;
                    } else {
                        footerText = footerText + forcerNickname;
                    }
                    await user.send({ embeds: [emb.generate(`Bonjour, ${member.nickname}`, null, `Vous n'avez pas pris votre fin de service.\nMerci d'y penser à l'avenir !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, `Gestion du service`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${guild.icon}.webp`, null, footerText, null, true)] });
                } catch(err) {
                }
            }
            resolve('Ok!');
        });
    }
}