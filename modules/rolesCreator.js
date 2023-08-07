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
            const irisRolePos = await guild.roles.cache.get(process.env.IRIS_PRIVATE_ROLE_ID);
            try {
                await role.setPosition(irisRolePos.rawPosition - 1);
            } catch (err) {
                logger.error(err);
                await role.setPosition(irisRolePos.rawPosition - 2);
            }
            await debugSQL.clearDebugRole();
            await debugSQL.setDebugRole(role.id);
            resolve(role);
        });
    }
}