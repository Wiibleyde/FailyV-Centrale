//Récup des fonctions pour créer des boutons
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
//Récup du logger
const logger = require('../modules/logger');
//Récup du créateur d'embed
const emb = require('../modules/embeds');

module.exports = {
    //Création de la commande
    execute: async function(interaction, errEmb) {
        //Regex des numéros de téléphone
        const regExpFull = new RegExp("^555-[0-9]{4}$");
        const regExpMidFull = new RegExp("^555[0-9]{4}$");
        const regExp = new RegExp("^[0-9]{4}$");
        //Check if phone number is valid
        if (!regExpFull.test(interaction.components[1].components[0].value) && !regExpMidFull.test(interaction.components[1].components[0].value) && !regExp.test(interaction.components[1].components[0].value)) {
            try {
                await interaction.reply({ content: `Le numéro de téléphone ${interaction.components[1].components[0].value} n'est pas valide. Veuillez entrer un numéro de téléphone valide (555-5420 ou 5555420 ou 5420).`, ephemeral: true });
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
        //Create embed
        const rendezVousEmb = emb.generate(null, null, null, `#FF0000`, process.env.LSMS_LOGO_V2, null, `Prise de rendez-vous`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).icon}.webp`, null, pseudo, null, false);
        rendezVousEmb.addFields(
            {
                name: `**Patient**`,
                value: `${interaction.components[0].components[0].value}`,
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
            }
        );
        //Get channel by looking at env var
        const channelToSend = interaction.guild.channels.cache.get(process.env.IRIS_PSYCHO_CHANNEL_ID);
        //Ajout des boutons sous l'embed pour : Dire que le rendez vous est fini, que la personne a été contactée, que le rendez-vous a été pris/que la date a été fixée, que le rendez-vous a été annulé
        const rendezVousActionRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('rendezVousFini').setLabel("Rendez-vous fini").setStyle(ButtonStyle.Success).setEmoji("✅").setDisabled(false),
            new ButtonBuilder().setCustomId('rendezVousContacte').setLabel("Personne contactée").setStyle(ButtonStyle.Secondary).setEmoji("📞").setDisabled(true),
            new ButtonBuilder().setCustomId('rendezVousPris').setLabel("Rendez-vous pris").setStyle(ButtonStyle.Primary).setEmoji("📆").setDisabled(true),
            new ButtonBuilder().setCustomId('rendezVousAnnule').setLabel("Rendez-vous annulé").setStyle(ButtonStyle.Danger).setEmoji("❌").setDisabled(false)
        );
        //Send embed with buttons
        channelToSend.send({ embeds: [rendezVousEmb], components: [rendezVousActionRow] });
        //Send confirmation message
        await interaction.reply({ embeds: [emb.generate(null, null, `Le rendez-vous de psychologie a bien été ajouté à l'agenda !`, `#0DE600`, process.env.LSMS_LOGO_V2, null, `Prise de rendez-vous`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.client.guilds.cache.get(process.env.IRIS_PRIVATE_GUILD_ID).icon}.webp`, null, null, null, false)], ephemeral: true });
    }
}