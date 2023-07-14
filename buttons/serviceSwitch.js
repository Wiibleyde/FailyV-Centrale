//Récup du logger
const logger = require('./../modules/logger');
//Récup du créateur d'embed
const emb = require('./../modules/embeds');

const serviceID = process.env.IRIS_SERVICE_ROLE_ID;
const dispatchID = process.env.IRIS_DISPATCH_ROLE_ID;
const offID = process.env.IRIS_OFF_ROLE_ID;

module.exports = {
    execute: async function(interaction, errEmb) {
        try {
            let embed;
            let switchRole = interaction.guild.roles.cache.find(role => role.id === serviceID);
            if(interaction.member.roles.cache.has(serviceID)) {
                let roleRemoved = '';
                if(interaction.member.roles.cache.has(dispatchID)) {
                    let dispatchRole = interaction.guild.roles.cache.find(role => role.id === dispatchID);
                    interaction.member.roles.remove(dispatchRole);
                    roleRemoved = roleRemoved + '-dispatch';
                }
                if(interaction.member.roles.cache.has(offID)) {
                    let offRole = interaction.guild.roles.cache.find(role => role.id === offID);
                    interaction.member.roles.remove(offRole);
                    roleRemoved = roleRemoved + '-off';
                }
                interaction.member.roles.remove(switchRole);
                if(roleRemoved == '') {
                    embed = emb.generate(`Fin de service`, null, `Bonne fin de service ${interaction.user} !`, `#FF0000`, null, null, `Gestion du service`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).icon}.webp`, null, null, null, false);
                } else if(roleRemoved == '-dispatch') {
                    embed = emb.generate(`Fin de service`, null, `Bonne fin de service ${interaction.user} !\n\n⚠️ Attention vous aviez toujours le rôle de dispatcheur, il vous à été retiré automatiquement !`, `#FF0000`, null, null, `Gestion du service`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).icon}.webp`, null, null, null, false);
                } else if(roleRemoved == '-off') {
                    embed = emb.generate(`Fin de service`, null, `Bonne fin de service ${interaction.user} !\n\nComme vous n'êtes plus en service, le rôle de off radio vous a été retiré automatiquement !`, `#FF0000`, null, null, `Gestion du service`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).icon}.webp`, null, null, null, false);
                } else {
                    embed = emb.generate(`Fin de service`, null, `Bonne fin de service ${interaction.user} !\n\n⚠️ Attention vous aviez toujours le rôle de dispatcheur et off radio, ils vous ont été retirés automatiquement !`, `#FF0000`, null, null, `Gestion du service`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).icon}.webp`, null, null, null, false);
                }
            } else {
                interaction.member.roles.add(switchRole);
                embed = emb.generate(`Prise de service`, null, `Bonne prise de service ${interaction.user} !`, `#0DE600`, null, null, `Gestion du service`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).icon}.webp`, null, null, null, false);
            }
            //Confirmation à l'utilisateur du succès de l'opération
            await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch(err) {
            logger.error(err);
            await interaction.reply({ embeds: [errEmb], ephemeral: true });
        }
    }
}