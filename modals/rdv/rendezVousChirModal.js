//Récup des fonctions pour créer des boutons
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
//Récup du logger
const logger = require('../../modules/logger');
//Récup du créateur d'embed
const emb = require('../../modules/embeds');
//Fonction pour attendre
const wait = require('node:timers/promises').setTimeout;
//Récup du formateur de noms
const format = require('../../modules/formatName');
//Récup du module sql
const rdv = require('../../sql/rdvManagment/rdv');
//Récup du module sql
const chanSql = require('../../sql/config/config');
// IRIS_SURGERY_CHANNEL_ID
const IRIS_SURGERY_CHANNEL_ID = sql.getChannel('IRIS_SURGERY_CHANNEL_ID');
const channelToSend = guild.channels.cache.get(IRIS_SURGERY_CHANNEL_ID[0].id);

module.exports = {
    //Création de la commande
    execute: async function (interaction, errEmb) {
        //Regex des numéros de téléphone
        const regExpFull = new RegExp("^555-[0-9]{4}$");
        const regExpMidFull = new RegExp("^555[0-9]{4}$");
        const regExp = new RegExp("^[0-9]{4}$");
        //Check if phone number is valid
        if (!regExpFull.test(interaction.components[1].components[0].value) && !regExpMidFull.test(interaction.components[1].components[0].value) && !regExp.test(interaction.components[1].components[0].value)) {
            try {
                await interaction.reply({ content: `Le numéro de téléphone ${interaction.components[1].components[0].value} est invalide. Veuillez entrer un numéro de téléphone valide (555-5420 ou 5555420 ou 5420).`, ephemeral: true });
            } catch (e) {
                logger.error(e);
            }
            return;
        }
        let phoneNumber = "";
        if (regExpFull.test(interaction.components[1].components[0].value)) {
            phoneNumber = interaction.components[1].components[0].value;
        } else if (regExpMidFull.test(interaction.components[1].components[0].value)) {
            phoneNumber = interaction.components[1].components[0].value.substring(3);
            phoneNumber = `555-${phoneNumber}`;
        } else if (regExp.test(interaction.components[1].components[0].value)) {
            phoneNumber = `555-${interaction.components[1].components[0].value}`;
        }
        //Get user guild pseudo
        const pseudo = interaction.member.displayName;
        //Format patient name
        const patient = format.name(interaction.components[0].components[0].value.toLowerCase());
        //Create embed
        const rendezVousEmb = emb.generate(null, null, null, process.env.LSMS_COLORCODE, process.env.LSMS_LOGO_V2, null, `Prise de rendez-vous`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, pseudo, null, false);
        rendezVousEmb.addFields(
            {
                name: `**Patient**`,
                value: `${patient}`,
                inline: true
            },
            {
                name: `**Téléphone**`,
                value: `${phoneNumber}`,
                inline: true
            },
            {
                name: `**Note**`,
                value: `${interaction.components[2].components[0].value}`,
                inline: false
            },
            {
                name: `**Contacté**`,
                value: `**0** fois`,
                inline: false
            },
        );
        //Ajout des boutons sous l'embed pour : Dire que le rendez vous est fini, que la personne a été contactée, que le rendez-vous a été pris/que la date a été fixée, que le rendez-vous a été annulé
        const rendezVousActionRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('rendezVousFini').setLabel("Terminer/Supprimer").setStyle(ButtonStyle.Success).setEmoji("896393106700775544").setDisabled(false),
            new ButtonBuilder().setCustomId('rendezVousContacte').setLabel("Personne contactée").setStyle(ButtonStyle.Primary).setEmoji("📱").setDisabled(false),
            new ButtonBuilder().setCustomId('rendezVousPris').setLabel("Rendez-vous pris").setStyle(ButtonStyle.Danger).setEmoji("📆").setDisabled(false)
        );
        //Send embed with buttons
        const rdvMsg = await channelToSend.send({ embeds: [rendezVousEmb], components: [rendezVousActionRow] });
        //Save RDV in DB
        await rdv.registerRDV(1, patient, phoneNumber, interaction.components[2].components[0].value, `**0** fois`, pseudo, rdvMsg.id);
        //Send confirmation message
        await interaction.reply({ embeds: [emb.generate(null, null, `Le rendez-vous de chirurgie a bien été ajouté à l'agenda !`, `#0DE600`, process.env.LSMS_LOGO_V2, null, `Prise de rendez-vous`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });            // Supprime la réponse après 5s
        await wait(5000);
        await interaction.deleteReply();
    }
}