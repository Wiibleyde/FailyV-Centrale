//Récupération des fonctions pour créer une commande
const { SlashCommandBuilder } = require('discord.js');
//Récup du logger
const logger = require('../../modules/logger');
//Récup du créateur d'embed
const emb = require('../../modules/embeds');
//Récup du WS pour MAJ les radios
const radioServer = require('../../modules/commonRadioServer');
//Récup du modificateur de radio
const radio = require('../../modules/changeRadio');
//Fonction pour attendre
const wait = require('node:timers/promises').setTimeout;

const serviceID = process.env.IRIS_SERVICE_ROLE_ID;

module.exports = {
    //Création de la commande
    data: new SlashCommandBuilder()
        .setName('radio')
        .setDescription('Changer à la main un radio spécifique')
        .addStringOption(option => 
            option.setName('organisme')
            .setDescription('Organisme pour lequel changer la fréquence radio')
            .addChoices(
                {
                    name: '1-LSMS',
                    value: 'regenLSMS'
                },
                {
                    name: '2-FDO',
                    value: 'regenFDO'
                },
                {
                    name: '3-BCMS',
                    value: 'regenBCMS'
                },
                {
                    name: '4-Event',
                    value: 'regenEvent'
                }
            ).setRequired(true)
        )
        .addStringOption(option => 
            option.setName('frequence')
            .setDescription('Fréquence radio')
            .setMinLength(5)
            .setMaxLength(5)
            .setRequired(true)
        ),
    async execute(interaction) {
    if(interaction.member.roles.cache.has(serviceID)) {
        const radioRegex = /^[0-9]{3}\.[0-9]{1}$/;
        const newRadio = interaction.options.getString('frequence');
        if(radioRegex.test(newRadio)) {
            if(parseInt(newRadio.substring(0,3)) >= 250 && parseInt(newRadio.substring(0,3)) < 400) {
                let orga;
                if(interaction.options.getString('organisme') == 'regenLSMS') { orga = 'LSMS'; radio.change(interaction.client, interaction.options.getString('organisme'), newRadio, true); }
                if(interaction.options.getString('organisme') == 'regenFDO') { orga = 'FDO'; radioServer.askManualRefresh('lsms-lspd-lscs', newRadio); }
                if(interaction.options.getString('organisme') == 'regenBCMS') { orga = 'BCMS'; radioServer.askManualRefresh('lsms-bcms', newRadio); }
                if(interaction.options.getString('organisme') == 'regenEvent') { orga = 'évènementielle'; radio.change(interaction.client, interaction.options.getString('organisme'), newRadio, true); }
                await interaction.reply({ embeds: [emb.generate(null, null, `La radio **${orga}** à bien été mise à jour sur **${newRadio}** !`, `#0DE600`, process.env.LSMS_LOGO_V2, null, `Gestion des radios`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).icon}.webp`, null, null, null, false)], ephemeral: true });
                // Supprime la réponse après 5s
                await wait(5000);
                await interaction.deleteReply();
            } else {
                await interaction.reply({ embeds: [emb.generate(`Radio invalide :(`, null, `Désolé, la fréquence que vous avez entrée n'est pas une fréquence valide !\nElle doit obligatoirement être entre **250.0** et **399.9**`, `#FF0000`, process.env.LSMS_LOGO_V2, null, null, null, null, interaction.client.user.username, interaction.client.user.avatarURL(), true)], ephemeral: true });
                // Supprime la réponse après 5s
                await wait(5000);
                await interaction.deleteReply();
            }
        } else {
            await interaction.reply({ embeds: [emb.generate(`Radio invalide :(`, null, `Désolé, la fréquence que vous avez entrée n'est pas une fréquence valide !\nElle doit obligatoirement être au format **trois chiffres point un chiffre** (**000.0**)`, `#FF0000`, process.env.LSMS_LOGO_V2, null, null, null, null, interaction.client.user.username, interaction.client.user.avatarURL(), true)], ephemeral: true });
            // Supprime la réponse après 5s
            await wait(5000);
            await interaction.deleteReply();
        }
    } else {
        await interaction.reply({ embeds: [emb.generate(`Action impossible !`, null, `Désolé, vous devez être en service pour régénérer une radio !`, `#FF0000`, process.env.LSMS_LOGO_V2, null, null, null, null, interaction.client.user.username, interaction.client.user.avatarURL(), true)], ephemeral: true });
        // Supprime la réponse après 5s
        await wait(5000);
        await interaction.deleteReply();
    }
    },
};