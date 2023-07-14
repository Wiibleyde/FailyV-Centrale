//Discord init
const { ActivityType } = require('discord.js');
//Récup du logger
const logger = require('./../modules/logger');
//Récup du créateur d'embed
const emb = require('./../modules/embeds');

const serviceRoleId = process.env.IRIS_SERVICE_ROLE_ID;
const dispatchRoleId = process.env.IRIS_DISPATCH_ROLE_ID;

module.exports = {
    name: 'guildMemberUpdate',
    async execute(oldMember, newMember) {
        //logger.debug(oldMember);
        if (newMember.roles.cache.has(serviceRoleId) || oldMember.roles.cache.has(serviceRoleId) || newMember.roles.cache.has(dispatchRoleId) || oldMember.roles.cache.has(dispatchRoleId)) {

            let countPDS;
            let dispatch;
            // If the role(s) are present on the old member object but no longer on the new one (i.e role(s) were removed)
            const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));
            if (removedRoles.size > 0) {
                countPDS = oldMember.guild.roles.cache.get(serviceRoleId).members.size;
                dispatch = oldMember.guild.roles.cache.get(dispatchRoleId).members.size;
            }
    
            // If the role(s) are present on the new member object but are not on the old one (i.e role(s) were added)
            const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
            if (addedRoles.size > 0) {
                countPDS = newMember.guild.roles.cache.get(serviceRoleId).members.size;
                dispatch = newMember.guild.roles.cache.get(dispatchRoleId).members.size;
            }

            const guild = newMember.guild;
            const chan = guild.channels.cache.get(process.env.IRIS_SERVICE_LOGS_ID);
            if(addedRoles.map(d => d.id) == serviceRoleId) {
                chan.send({ embeds: [emb.generate(null, null, `${newMember.nickname}`, `#0DE600`, null, null, `Prise de service`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${newMember.client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).icon}.webp`, null, null, null, true)] });
            }
            if(removedRoles.map(d => d.id) == serviceRoleId) {
                chan.send({ embeds: [emb.generate(null, null, `${newMember.nickname}`, `#FF0000`, null, null, `Fin de service`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${newMember.client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).icon}.webp`, null, null, null, true)] });
            }
            if(addedRoles.map(d => d.id) == dispatchRoleId) {
                chan.send({ embeds: [emb.generate(null, null, `${newMember.nickname}`, `#84FFFF`, null, null, `Prise de dispatch`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${newMember.client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).icon}.webp`, null, null, null, true)] });
            }
            if(removedRoles.map(d => d.id) == dispatchRoleId) {
                chan.send({ embeds: [emb.generate(null, null, `${newMember.nickname}`, `#84FFFF`, null, null, `Dispatch relaché`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${newMember.client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).icon}.webp`, null, null, null, true)] });
            }

            //Affichage de l'activitée du bot
            if(countPDS != null && dispatch != null) {
                newMember.client.user.setPresence({ activities: [{ name: `🚑 ` + countPDS + ` | 🎙️ ` + dispatch, type: ActivityType.Watching }], status: 'online' });
            }
    
        }
    }
};