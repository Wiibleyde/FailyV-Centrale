//Récup du logger
const logger = require('../../modules/logger');
//Récup du créateur d'embed
const emb = require('../../modules/embeds');
//Fonction pour attendre
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    execute: async function(interaction, errEmb) {
        const title = `Bug Report`;
        const serverIcon = `https://cdn.discordapp.com/icons/${interaction.guild.id}/${interaction.guild.icon}.webp`;
        const thumb = process.env.DEV_LOGO;
        //Affichage du message "Iris réfléchis..."
        await interaction.deferReply({ ephemeral: true });
        let name = interaction.guild.members.cache.get(process.env.IRIS_DISCORD_ID).nickname;
        if(name == null) {
            name = interaction.client.user.username;
        }
        const userid = interaction.message.embeds[0].author.name.split('@')[1].split('>')[0];
        let fixTime;
        if(interaction.customId == 'checkDebug') {
            fixTime = 'dans **peu de temps**';
        } else {
            fixTime = 'au prochain **reboot de 06h00**';
        }
        let userGuild = null;
        interaction.client.guilds.cache.map(guild => {
            if(guild.members.cache.get(userid) != null) {
                userGuild = guild.id;
            }
        });
        if(userGuild != null) {
            const user = interaction.client.guilds.cache.get(userGuild).members.cache.get(userid);
            try {
                //Retour à l'utilisateur de sa demande de debug
                await user.send({ embeds: [emb.generate('Suite à votre demande de debug', null, `La demande de debug de la foncitonnalité **${interaction.message.embeds[0].title.split(': ')[1]}** a bien été revue et corrigée !\nLa mise à jour sera disponible ${fixTime}`, '#0DE600', `https://cdn.discordapp.com/attachments/1083724872045297734/1084447289914970182/yes.webp`, null, null, null, null, `Cordialement, ` + interaction.user.username, interaction.user.avatarURL(), true)] });
                await interaction.followUp({ embeds: [emb.generate('Demande fixée', null, `**${interaction.message.embeds[0].author.name}** à bien été prévenu du retour concernant sa demande !`, '#0DE600', thumb, null, title, serverIcon, null, null, null, true)], ephemeral: true });
                await interaction.message.delete();
                // Supprime la réponse après 5s
                await wait(5000);
                await interaction.deleteReply();
            } catch (err) {
                //Si l'utilisateur à ses MP de fermés
                if(err.code == 50007) {
                    try {
                        await interaction.followUp({ embeds: [emb.generate('⚠️ Attention', null, `L'utilisateur **${interaction.message.embeds[0].author.name}** n'a pas été prévenu du retour car il a ses MP de fermés`, 'Gold', thumb, null, title, serverIcon, null, null, null, true)], ephemeral: true });
                        await interaction.message.delete();
                        // Supprime la réponse après 5s
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
        } else {
            try {
                await interaction.followUp({ embeds: [emb.generate('⚠️ Attention', null, `L'utilisateur **${interaction.message.embeds[0].author.name}** n'a pas été prévenu du retour car il n'a pas été trouvé sur un serveur en commun !`, '#FF0000', thumb, null, title, serverIcon, null, null, null, true)], ephemeral: true });
                await interaction.message.delete();
                // Supprime la réponse après 5s
                await wait(5000);
                await interaction.deleteReply();
            } catch (err) {
                logger.error(err);
                await interaction.followUp({ embeds: [errEmb], ephemeral: true });
            }
        }
    }
}