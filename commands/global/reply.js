//Récupération des fonctions pour créer une commande
const { SlashCommandBuilder } = require('discord.js');
//Récup du logger
const logger = require('../../modules/logger');
//Récup du créateur d'embed
const emb = require('../../modules/embeds');
//Fonction pour attendre
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    //Création de la commande
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('[DEV ONLY] Faire parler Iris dans le salon actuel')
        .addStringOption(option =>
            option.setName('texte')
            .setDescription('Ce que doit dire Iris')
            .setRequired(true)
        ).addStringOption(option =>
            option.setName('id')
            .setDescription('ID du message auquel Iris doit répondre')
            .setRequired(true)
        ),
    async execute(interaction) {
        const serverIcon = `https://cdn.discordapp.com/icons/${interaction.guild.id}/${interaction.guild.icon}webp`;
        const title = `Iris interaction`;
        if(interaction.user.id == '461880599594926080' || interaction.user.id == '461807010086780930' || interaction.user.id == '368259650136571904') {
            //Affichage du message "Iris réfléchis..."
            await interaction.deferReply({ ephemeral: true });
            try {
                const msgToReply = await interaction.guild.channel.messages.fetch(interaction.options.getString('id'));
                await msgToReply.reply({ content: interaction.options.getString('texte') });
                await interaction.followUp({ embeds: [emb.generate(null, null, `Message envoyé !`, `#0DE600`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, true)], ephemeral: true });
            } catch (err) {
                logger.error(err);
                await interaction.followUp({ embeds: [emb.generate(`Oups :(`, null, `Une erreur est survenue lors de l'envois du message !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, true)], ephemeral: true });
            }
            await wait(5000);
            await interaction.deleteReply();
        } else {
            await interaction.reply({ embeds: [emb.generate(`Désolé :(`, null, `Cette commande est réservé à mes développeurs (<@461880599594926080>, <@461807010086780930> et <@368259650136571904>) !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, title, serverIcon, null, null, null, true)], ephemeral: true });
            await wait(5000);
            await interaction.deleteReply();
        }
    }
};