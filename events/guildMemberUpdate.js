//Discord init
const { ActivityType } = require('discord.js');
//Récup du logger
const logger = require('./../modules/logger');
//Récup du créateur d'embed
const emb = require('./../modules/embeds');
//Récup des requêtes SQL de debug
const debugSQL = require('./../sql/debugMode/debugMode');
//Récup des requêtes SQL du nom
const nameSQL = require('./../sql/rename/rename');

const serviceRoleId = process.env.IRIS_SERVICE_ROLE_ID;
const dispatchRoleId = process.env.IRIS_DISPATCH_ROLE_ID;

module.exports = {
    name: 'guildMemberUpdate',
    once: false,
    async execute(oldMember, newMember) {
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

            //Affichage de l'activitée du bot
            if(countPDS != null && dispatch != null) {
                let isDebugMode = false;
                const newDebugState = await debugSQL.getDebugState();
                if(newDebugState[0].state == '1') {
                    isDebugMode = true;
                }
                let state;
                let debugText = '';
                if(isDebugMode) { state = 'dnd'; debugText = ' | DEBUG MODE' } else { state = 'online'; }
                newMember.client.user.setPresence({ activities: [{ name: `🚑 ` + countPDS + ` | 🎙️ ` + dispatch + debugText, type: ActivityType.Watching }], status: state });
            }
    
        }
        if(oldMember.user.id == process.env.IRIS_DISCORD_ID && oldMember.guildId == process.env.IRIS_PRIVATE_GUILD_ID) {
            const customName = await nameSQL.getName();
            if(customName[0] != null) {
                if(newMember.nickname != customName[0].name) {
                    newMember.setNickname(customName[0].name);
                }
            } else {
                newMember.setNickname('');
            }
        }
    }
};