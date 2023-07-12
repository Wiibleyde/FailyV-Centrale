//Récup des fonctions pour créer des boutons
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
//Récup du logger
const logger = require('./../modules/logger');
//Récup du créateur d'embed
const emb = require('./../modules/embeds');

module.exports = {
    execute: async function(interaction, errEmb) {
        //Affichage du message "Iris réfléchis..."
        await interaction.deferReply({ ephemeral: true });
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
            createdEmbed = emb.generate('Commande: ' + interaction.components[0].components[0].value, null, '**Comment cela ce produit-il ?** \n' + interaction.components[1].components[0].value, 'Gold', null, null, `${interaction.user.username} (<@${interaction.user.id}>)`, interaction.user.avatarURL(), null, footName, footIcon, true);
            createdEmbed.addFields([
                {
                    name: `Le fait-il à chaques fois ?`,
                    value: interaction.components[2].components[0].value,
                    inline: true
                }
            ]);
            //Création d'un embed de réponse
            responseEmbed = emb.generate('Prise en compte de votre demande de debug', null, '**Nous avons bien enregistré votre demande de debug** \nVous recevrez une réponse sous peu.', '#ffffff', 'https://cdn.discordapp.com/attachments/1083724872045297734/1093600460511920138/loading.gif', null, null, null, null, interaction.client.user.username, interaction.client.user.avatarURL(), true);
        } catch (err) {
            interaction.channel.send({ content: `${interaction.user}`, embeds: [errEmb], ephemeral: true });
            logger.error(err);
        }

        //Création d'un bouton pour accepter ou non la demande de debug
        const btns = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('checkDebug').setLabel('Bug fixé').setStyle(ButtonStyle.Success).setEmoji('896393106700775544'),
            new ButtonBuilder().setCustomId('denyDebug').setLabel('Annuler le bug').setStyle(ButtonStyle.Danger).setEmoji('896393106633687040')
        );

        
        //Récupération du channel où l'embed doit être créer
        const debugGuild = interaction.client.guilds.cache.get(process.env.IRIS_DEBUG_GUILD_ID);
        const chan = debugGuild.channels.cache.get(process.env.IRIS_DEBUG_CHANNEL_ID);

        try {
            //Envois de l'embed avec boutons
            await chan.send({ content: '**<@&1128704532159922318> bug report !**', embeds: [ createdEmbed ], components: [ btns ] });
            //Confermation à l'utilisateur du succès de la commande
            await interaction.user.send({ embeds: [ responseEmbed ] });
            await interaction.followUp({ embeds: [emb.generate('Merci !', null, `Votre bug report à bien été prise en compte !`, '#3cb34b', null, null, null, null, null, interaction.client.user.username, interaction.client.user.avatarURL(), true)], ephemeral: true });
        } catch (err) {
            //Si l'utilisateur à ses MP de fermés
            if(err.code == 50007) {
                try {
                    await interaction.followUp({ embeds: [emb.generate('Merci !', null, `Votre bug report à bien été prise en compte, n'hésitez pas à ouvrir vos MP avec moi pour être tenu au courant de l'évolution de votre demande !\n(Clique-droit sur le serveur en commun avec moi -> "Paramètres de confidentialité" -> "Messages privés")`, '#3cb34b', null, null, null, null, null, interaction.client.user.username, interaction.client.user.avatarURL(), true)], ephemeral: true });
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