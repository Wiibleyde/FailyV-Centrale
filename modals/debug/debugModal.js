//Récup des fonctions pour créer des boutons
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
//Récup du logger
const logger = require('../../modules/logger');
//Récup du créateur d'embed
const emb = require('../../modules/embeds');
//Fonction pour attendre
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    execute: async function(interaction, errEmb) {
        //Affichage du message "Iris réfléchis..."
        await interaction.deferReply({ ephemeral: true });
        let name = interaction.guild.members.cache.get(process.env.IRIS_DISCORD_ID).nickname;
        if(name == null) {
            name = interaction.client.user.username;
        }
        //Création de l'embed
        let createdEmbed = null;
        let responseEmbed = null;
        try {
            const interactGuild = interaction.client.guilds.cache.get(interaction.guildId);
            let footName;
            let footIcon;
            //Check si la commande est faite en MP ou sur une guild
            if(interactGuild == null) {
                footName = 'MP: ' + interaction.user.username;
                footIcon = interaction.user.avatarURL();
            } else {
                footName = interactGuild.name;
                footIcon = interactGuild.iconURL();
            }
            createdEmbed = emb.generate('Fonctionnalité: ' + interaction.components[0].components[0].value, null, '**Comment cela se produit-il ?** \n' + interaction.components[1].components[0].value, 'Gold', process.env.LSMS_LOGO_V2, null, `${interaction.user.username} (<@${interaction.user.id}>)`, interaction.user.avatarURL(), null, footName, footIcon, true);
            createdEmbed.addFields([
                {
                    name: `**Le fait-il à chaques fois ?**`,
                    value: interaction.components[2].components[0].value,
                    inline: false
                }
            ]);
            if(interaction.components[3].components[0].value != '') {
                createdEmbed.setImage(interaction.components[3].components[0].value);
            }
            //Création d'un embed de réponse
            responseEmbed = emb.generate('Prise en compte de votre demande de debug', null, '**Nous avons bien enregistré votre demande de debug** \nVous recevrez une réponse sous peu.', '#FFFFFF', 'https://cdn.discordapp.com/attachments/1083724872045297734/1093600460511920138/loading.gif', null, null, null, null, name, interaction.client.user.avatarURL(), true);
        } catch (err) {
            interaction.channel.send({ content: `${interaction.user}`, embeds: [errEmb] });
            logger.error(err);
        }

        //Création d'un bouton pour accepter ou non la demande de debug
        const btns = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('checkDebug').setLabel('Bug fixé direct').setStyle(ButtonStyle.Success).setEmoji('896393106700775544'),
            new ButtonBuilder().setCustomId('checkDebug6h').setLabel('Bug fixé au reboot de 06h').setStyle(ButtonStyle.Success).setEmoji('896393106700775544'),
            new ButtonBuilder().setCustomId('denyDebug').setLabel('Annuler le bug').setStyle(ButtonStyle.Danger).setEmoji('896393106633687040')
        );

        
        //Récupération du channel où l'embed doit être créer
        const debugGuild = interaction.client.guilds.cache.get(process.env.IRIS_DEBUG_GUILD_ID);
        const chan = debugGuild.channels.cache.get(process.env.IRIS_DEBUG_CHANNEL_ID);

        try {
            //Envois de l'embed avec boutons
            await chan.send({ content: '**<@&' + process.env.IRIS_DEBUG_ROLE_ID + '> bug report !**', embeds: [ createdEmbed ], components: [ btns ] });
            //Confermation à l'utilisateur du succès de la commande
            await interaction.user.send({ embeds: [ responseEmbed ] });
            await interaction.followUp({ embeds: [emb.generate('Merci !', null, `Votre bug report à bien été prise en compte !`, '#3CB34B', process.env.LSMS_LOGO_V2, null, null, null, null, name, interaction.client.user.avatarURL(), true)], ephemeral: true });
            // Supprime la réponse après 5s
            await wait(5000);
            await interaction.deleteReply();
        } catch (err) {
            //Si l'utilisateur à ses MP de fermés
            if(err.code == 50007) {
                try {
                    await interaction.followUp({ embeds: [emb.generate('Merci !', null, `Votre bug report à bien été prise en compte, n'hésitez pas à ouvrir vos MP avec moi pour être tenu au courant de l'évolution de votre demande !\n(Clique-droit sur le serveur en commun avec moi -> "Paramètres de confidentialité" -> "Messages privés")`, '#3CB34B', process.env.LSMS_LOGO_V2, null, null, null, null, name, interaction.client.user.avatarURL(), true)], ephemeral: true });            // Supprime la réponse après 5s
                    await wait(5000);
                    await interaction.deleteReply();
                } catch (err) {
                    logger.error(err);
                    await interaction.followUp({ embeds: [errEmb], ephemeral: true });
                }
            //Lors d'une vraie erreur
            } else {
                await interaction.followUp({ embeds: [errEmb], ephemeral: true });
                logger.error(err);
            }
        }
    }
}