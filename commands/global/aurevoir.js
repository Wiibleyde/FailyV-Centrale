// Récupération des fonctions pour créer une commande
const { SlashCommandBuilder } = require('discord.js');
// Récupération du logger
const logger = require('../../modules/logger');
// Récupération du créateur d'embed
const emb = require('../../modules/embeds');
//Récup du systeme de logs RP
const logRP = require('../../modules/logsRP');
//Récup des requêtes SQL de debug
const debugSQL = require('../../sql/debugMode/debugMode');
//Fonction pour attendre
const wait = require('node:timers/promises').setTimeout;
//Récup du service de kick
const service = require('../../modules/kickservice');

const blackout = require('../../modules/blackout');
const config = require('../../sql/config/config');
const rolesCreator = require('../../modules/rolesCreator');

module.exports = {
    // Création de la commande
    data: new SlashCommandBuilder()
        .setName('aurevoir')
        .setDescription('Chantrale fin de service...'),
    async execute(interaction) {
        const title = `Fin de service`;
        const client = interaction.client;
        const guild = client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID);
        const serverIcon = `https://cdn.discordapp.com/icons/${interaction.guild.id}/${interaction.guild.icon}.webp`;
        if(interaction.user.id != '461880599594926080' && interaction.user.id != '461807010086780930' && interaction.user.id != '368259650136571904') {
            await interaction.reply({ embeds: [emb.generate(`Désolé :(`, null, `Cette commande est réservé à mes développeurs (<@461880599594926080>, <@461807010086780930> et <@368259650136571904>) !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, true)], ephemeral: true });
            await wait(5000);
            return await interaction.deleteReply();
        }
        const serviceChanId = await config.getChannel('IRIS_PATCHNOTE_CHANNEL_ID');

        if(serviceChanId[0] == null) {
            await interaction.reply({ embeds: [emb.generate(`Désolé :(`, null, `Aucun salon de gestion du service n'a été défini !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, true)], ephemeral: true });
            await wait(5000);
            return await interaction.deleteReply();
        }
        const chan = guild.channels.cache.get(serviceChanId[0].id);
        const roleID = await debugSQL.getDebugRole();
        let debugRole = guild.roles.cache.get(roleID[0].roleID);
        if(debugRole == undefined) {
            debugRole = await rolesCreator.createDebugRole(interaction.client);
        }
        try { await guild.members.cache.get('461880599594926080').roles.add(debugRole); } catch (err) {} //ailedeuxplume
        try { await guild.members.cache.get('461807010086780930').roles.add(debugRole); } catch (err) {} //Wiibleyde
        try { await guild.members.cache.get('368259650136571904').roles.add(debugRole); } catch (err) {} //thenicolas190

        let botMember = guild.members.cache.get(process.env.IRIS_DISCORD_ID);
        service.kick(guild, botMember, true);

        botMember = botMember.nickname;
        if(botMember == null) {
            botMember = client.user.username;
        }
        await logRP.fds(guild, botMember, null);
        const endEmbed = emb.generate(`À tout les membres du LSMS`, null, `Merci beaucoup pour ce mois passés en votre compagnie, ça aura été un plaisir de vous avoir assistés et surtout de vous avoir causé des soucis de temps à autres <:UwUCat:1149676988240502815>\n\nMalheureusement toutes les bonnes choses ont une fin, ce soir le serveur c'est éteint et il est temps pour moi de faire de même\n\nÀ bientôt j'espère <:failyLOVE:1149676998940184667>\n\n**Chantrale (cheh Létrix <:keepo:1150929229589004399>) fin de service...**\n\u200b`, `#000001`, 'https://media.discordapp.net/stickers/1146143936994349146.webp?size=600', null, null, null, null, 'ailedeuxplume, Wiibleyde & Nicolas', client.user.avatarURL(), true);
        await chan.send({ content: `<@&${process.env.IRIS_LSMS_ROLE}>`, embeds: [endEmbed] });

        await interaction.reply({ embeds: [emb.generate(`Au revoir`, null, `Annonce de fin de service réussie, à bientôt je l'espère 💙`, `#000001`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, true)], ephemeral: true });
        await wait(5000);
        await interaction.deleteReply();
        logger.log(`Au revoir! ${client.user.tag} hors-ligne`);
        await client.destroy();
        process.exit(0);
    },
};
