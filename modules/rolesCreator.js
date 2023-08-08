const { PermissionsBitField } = require('discord.js');
const logger = require('./logger');
const debugSQL = require('./../sql/debugMode/debugMode');

module.exports = {
    createDebugRole: (client) => {
        return new Promise(async (resolve, reject) => {
            const guild = client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID);
            const role = await guild.roles.create({
                name: `Debug Mode`,
                permissions: [PermissionsBitField.Flags.Administrator],
                reason: `Creation of an admin role for debbuging problems on the server`
            });
            await debugSQL.clearDebugRole();
            await debugSQL.setDebugRole(role.id);
            let irisRolePos = 1;
            await guild.roles.fetch().then(d => d.map(roleFound => {
                if(roleFound.id == process.env.IRIS_PRIVATE_ROLE_ID) { irisRolePos = roleFound.rawPosition; }
            }));
            for(let i=irisRolePos;i>0;i--) {
                try {
                    await role.setPosition(i);
                    return;
                } catch (err) {
                    logger.error(err);
                }
            }
            resolve(role);
        });
    }
}