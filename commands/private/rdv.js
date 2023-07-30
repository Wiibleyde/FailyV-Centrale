//Récupération des fonctions pour créer une commande et un modal
const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
//Récup du logger
const logger = require('../../modules/logger');
//Récup du module sql
const rdv = require('../../sql/rdvManagment/rdv');
//Récup du créateur d'embed
const emb = require('../../modules/embeds');

const sql = require('../../sql/config/config');
// IRIS_PSYCHO_CHANNEL_ID
const IRIS_PSYCHO_CHANNEL_ID = sql.getChannel('IRIS_PSYCHO_CHANNEL_ID');
const psychoChannelId = guild.channels.cache.get(IRIS_PSYCHO_CHANNEL_ID[0].id);
// IRIS_SURGERY_CHANNEL_ID
const IRIS_SURGERY_CHANNEL_ID = sql.getChannel('IRIS_SURGERY_CHANNEL_ID');
const surgeryChannelId = guild.channels.cache.get(IRIS_SURGERY_CHANNEL_ID[0].id);
// IRIS_GENERAL_CHANNEL_ID
const IRIS_GENERAL_CHANNEL_ID = sql.getChannel('IRIS_GENERAL_CHANNEL_ID');
const generalChannelId = guild.channels.cache.get(IRIS_GENERAL_CHANNEL_ID[0].id);

//Création de constantes pour le choix de rendez-vous
const rdvGen = {
    name: 'Créer un rendez-vous général',
    value: 'general',
}
const rdvChir = {
    name: 'Créer un rendez-vous de chirurgie',
    value: 'chirurgie',
};
const rdvPsy = {
    name: 'Créer un rendez-vous de psychologie',
    value: 'psychologie',
};
const rdvSee = {
    name: 'Voir le nombre de rendez-vous actuels',
    value: 'see',
};

const rdvRegen = {
    name: 'Régénérer les rendez-vous',
    value: 'regen',
};


module.exports = {
    //Création de la commande
    data: new SlashCommandBuilder()
        .setName('rdv')
        .setDescription('Ajouter un rendez-vous à l\'agenda.')
        //Ajout des choix pour le type de rendez-vous
        .addStringOption(option =>
            option.setName('action')
                .setDescription('Que souhaitez-vous faire ?')
                .setRequired(true)
                .addChoices(rdvGen, rdvChir, rdvPsy, rdvSee, rdvRegen)
        ),
    async execute(interaction) {
        //Si le type est psy
        if (interaction.options.getString('action') === 'psychologie') {
            //Création du modal
            const rendezVousPsyModal = new ModalBuilder().setCustomId('rendezVousPsyModal').setTitle('Ajout d\'un rendez-vous');
            const nomPrenom = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('nomPrenom').setLabel('Nom et prénom de la personne concernée').setStyle(TextInputStyle.Short).setPlaceholder('Ex: Nathan Prale').setRequired(true));
            const numero = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('numero').setLabel('Numéro de téléphone de la personne concernée').setStyle(TextInputStyle.Short).setPlaceholder('Ex: 555-5420 ou 5555420 ou 5420').setRequired(true));
            const description = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('description').setLabel('Description du rendez-vous').setStyle(TextInputStyle.Paragraph).setPlaceholder("Ex: Nathan Prale a besoin d\'une consultation pour parler à la suite de prises d'otage").setRequired(true));
            rendezVousPsyModal.addComponents(nomPrenom, numero, description);
            //Envoi du modal
            await interaction.showModal(rendezVousPsyModal);
        //Si le type est chir
        } else if(interaction.options.getString('action') === 'chirurgie') {
            //Création du modal
            const rendezVousChirModal = new ModalBuilder().setCustomId('rendezVousChirModal').setTitle('Ajout d\'un rendez-vous');
            const nomPrenom = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('nomPrenom').setLabel('Nom et prénom de la personne concernée').setStyle(TextInputStyle.Short).setPlaceholder('Ex: Nathan Prale').setRequired(true));
            const numero = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('numero').setLabel('Numéro de téléphone de la personne concernée').setStyle(TextInputStyle.Short).setPlaceholder('Ex: 555-5420 ou 5555420 ou 5420').setRequired(true));
            const description = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('description').setLabel('Description du rendez-vous').setStyle(TextInputStyle.Paragraph).setPlaceholder("Ex: Nathan Prale a besoin d\'une consultation pour parler à la suite de prises d'otage").setRequired(true));
            rendezVousChirModal.addComponents(nomPrenom, numero, description);
            //Envoi du modal
            await interaction.showModal(rendezVousChirModal);
        //Si le type est général
        } else if(interaction.options.getString('action') === 'general') {
            //Création du modal
            const rendezVousGenModal = new ModalBuilder().setCustomId('rendezVousGenModal').setTitle('Ajout d\'un rendez-vous');
            const nomPrenom = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('nomPrenom').setLabel('Nom et prénom de la personne concernée').setStyle(TextInputStyle.Short).setPlaceholder('Ex: Nathan Prale').setRequired(true));
            const numero = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('numero').setLabel('Numéro de téléphone de la personne concernée').setStyle(TextInputStyle.Short).setPlaceholder('Ex: 555-5420 ou 5555420 ou 5420').setRequired(true));
            const description = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('description').setLabel('Description du rendez-vous').setStyle(TextInputStyle.Paragraph).setPlaceholder("Ex: Nathan Prale a besoin d\'une consultation pour parler à la suite de prises d'otage").setRequired(true));
            rendezVousGenModal.addComponents(nomPrenom, numero, description);
            //Envoi du modal
            await interaction.showModal(rendezVousGenModal);
        } else if(interaction.options.getString('action') === 'see') {
            //Affichage du message "Iris réfléchis..."
            await interaction.deferReply({ ephemeral: true });
            const numInG = await rdv.getRDVByType(0);
            const numInChir = await rdv.getRDVByType(1);
            const numInPsy = await rdv.getRDVByType(2);
            let numInGText;
            if(numInG.length == 1) { numInGText = `**${numInG.length}** rendez-vous général`; } else { numInGText = `**${numInG.length}** rendez-vous généraux`; }
            interaction.followUp({ embeds: [emb.generate(null, null, `Il y a actuellement\n- ${numInGText}\n- **${numInChir.length}** rendez-vous de chirurgie\n- **${numInPsy.length}** rendez-vous de psychologie\n\d'enregistrés ! Si vous constatez qu'il manque un rendez-vous n'hésitez pas à utiliser l'option "**Régénérer les rendez-vous**" de la commande </${interaction.commandName}:${interaction.commandId}> !`, process.env.LSMS_COLORCODE, process.env.LSMS_LOGO_V2, null, `Prise de rendez-vous`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)], ephemeral: true });
        } else if(interaction.options.getString('action') === 'regen') {
            //Affichage du message "Iris réfléchis..."
            await interaction.deferReply({ ephemeral: true });
            await psychoChannelId.messages.fetch().then(m => { m.forEach(async msg => await msg.delete()); });
            await surgeryChannelId.messages.fetch().then(m => { m.forEach(async msg => await msg.delete()); });
            await generalChannelId.messages.fetch().then(m => { m.forEach(async msg => await msg.delete()); });
            const numInG = await rdv.getRDVByType(0);
            const numInChir = await rdv.getRDVByType(1);
            const numInPsy = await rdv.getRDVByType(2);
            const rendezVousActionRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('rendezVousFini').setLabel("Terminer/Supprimer").setStyle(ButtonStyle.Success).setEmoji("896393106700775544").setDisabled(false),
                new ButtonBuilder().setCustomId('rendezVousContacte').setLabel("Personne contactée").setStyle(ButtonStyle.Primary).setEmoji("📱").setDisabled(false),
                new ButtonBuilder().setCustomId('rendezVousPris').setLabel("Rendez-vous pris").setStyle(ButtonStyle.Danger).setEmoji("📆").setDisabled(false)
            );
            for(i=0;i<numInG.length;i++) {
                //Create embed
                const rendezVousEmb = emb.generate(null, null, null, numInG[i].color, process.env.LSMS_LOGO_V2, null, `Prise de rendez-vous`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, numInG[i].writter, null, false);
                rendezVousEmb.addFields(
                    {
                        name: `**Patient**`,
                        value: `${numInG[i].patient}`,
                        inline: true
                    },
                    {
                        name: `**Téléphone**`,
                        value: `${numInG[i].phone}`,
                        inline: true
                    },
                    {
                        name: `**Note**`,
                        value: `${numInG[i].note}`,
                        inline: false
                    },
                    {
                        name: `**Contacté**`,
                        value: `${numInG[i].contact}`,
                        inline: false
                    },
                );
                if(numInG[i].taker != null) {
                    rendezVousEmb.addFields(
                        {
                            name: `**Rendez-vous pris par**`,
                            value: `${numInG[i].taker}`,
                            inline: false
                        }
                    );
                }
                const newMsg = await generalChannelId.send({ embeds: [rendezVousEmb], components: [rendezVousActionRow] });
                await rdv.updateRDVMessageId(numInG[i].messageID, newMsg.id);
            }
            for(i=0;i<numInChir.length;i++) {
                //Create embed
                const rendezVousEmb = emb.generate(null, null, null, numInChir[i].color, process.env.LSMS_LOGO_V2, null, `Prise de rendez-vous`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, numInChir[i].writter, null, false);
                rendezVousEmb.addFields(
                    {
                        name: `**Patient**`,
                        value: `${numInChir[i].patient}`,
                        inline: true
                    },
                    {
                        name: `**Téléphone**`,
                        value: `${numInChir[i].phone}`,
                        inline: true
                    },
                    {
                        name: `**Note**`,
                        value: `${numInChir[i].note}`,
                        inline: false
                    },
                    {
                        name: `**Contacté**`,
                        value: `${numInChir[i].contact}`,
                        inline: false
                    },
                );
                if(numInChir[i].taker != null) {
                    rendezVousEmb.addFields(
                        {
                            name: `**Rendez-vous pris par**`,
                            value: `${numInChir[i].taker}`,
                            inline: false
                        }
                    );
                }
                const newMsg = await surgeryChannelId.send({ embeds: [rendezVousEmb], components: [rendezVousActionRow] });
                await rdv.updateRDVMessageId(numInChir[i].messageID, newMsg.id);
            }
            for(i=0;i<numInPsy.length;i++) {
                //Create embed
                const rendezVousEmb = emb.generate(null, null, null, numInPsy[i].color, process.env.LSMS_LOGO_V2, null, `Prise de rendez-vous`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, numInPsy[i].writter, null, false);
                rendezVousEmb.addFields(
                    {
                        name: `**Patient**`,
                        value: `${numInPsy[i].patient}`,
                        inline: true
                    },
                    {
                        name: `**Téléphone**`,
                        value: `${numInPsy[i].phone}`,
                        inline: true
                    },
                    {
                        name: `**Note**`,
                        value: `${numInPsy[i].note}`,
                        inline: false
                    },
                    {
                        name: `**Contacté**`,
                        value: `${numInPsy[i].contact}`,
                        inline: false
                    },
                );
                if(numInPsy[i].taker != null) {
                    rendezVousEmb.addFields(
                        {
                            name: `**Rendez-vous pris par**`,
                            value: `${numInPsy[i].taker}`,
                            inline: false
                        }
                    );
                }
                const newMsg = await psychoChannelId.send({ embeds: [rendezVousEmb], components: [rendezVousActionRow] });
                await rdv.updateRDVMessageId(numInPsy[i].messageID, newMsg.id);
            }
            interaction.followUp({ embeds: [emb.generate(null, null, `Tous les rendez-vous ont correctement été régénérés !`, `#0DE600`, process.env.LSMS_LOGO_V2, null, `Prise de rendez-vous`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false)] });
        }
    },
}
