//Récupération des fonctions pour créer une commande et un modal
const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
//Récup du logger
const logger = require('./../../modules/logger');
//Récup du créateur d'embed
const emb = require('./../../modules/embeds');

//Récupération du créateur d'embed
const emb = require('../../functions/embed');

//Création d'un tableau de choix pour les channels d'envois des rendez-vous
const rendezVousChannelsChoices = [
    {
        name: 'psychologie',
        value: process.env.IRIS_PSYCHO_CHANNEL_ID,
    },
    {
        name: 'chirurgie',
        value: process.env.IRIS_SURGERY_CHANNEL_ID,
    },
];

//Création d'un tableau de choix pour le rendez-vous
const rendezVousChoices = [
    {
        name: 'Psychologie',
        value: 'psychologie',
    },
    {
        name: 'Chirurgie',
        value: 'chirurgie',
    },
];

module.exports = {
    //Création de la commande
    data: new SlashCommandBuilder()
        .setName('rendez-vous')
        .setDescription('Ajouter un rendez-vous à l\'agenda.')
        //Ajout des choix pour le type de rendez-vous
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Type de rendez-vous')
                .setRequired(true)
                .addChoices(rendezVousChoices)
        ),
    async execute(interaction) {
        const rendezVousModal = new ModalBuilder().setCustomId('rendezVousModal').setTitle('Ajout d\'un rendez-vous');
        const nomPrenom = new TextInputBuilder().setCustomId('nomPrenom').setLabel('Nom et prénom de la personne concernée').setStyle(TextInputStyle.Short).setPlaceholder('Ex: Nathan Prale').setRequired(true);
        const numero = new TextInputBuilder().setCustomId('numero').setLabel('Numéro de téléphone de la personne concernée').setStyle(TextInputStyle.Short).setPlaceholder('Ex: 555-XXXX').setRequired(true);
        const description = new TextInputBuilder().setCustomId('description').setLabel('Description du rendez-vous').setStyle(TextInputStyle.Paragraph).setPlaceholder("Ex: Nathan Prale a besoin d\'une consultation pour parler à la suite de prises d'otage").setRequired(true);
        //Get user guild pseudo
        const pseudo = interaction.member.displayName;
        //Create embed
        const rendezVousEmb = emb.generate(null, null, `**Nom et prénom:** ${nomPrenom}\n**Numéro de téléphone:** ${numero}\n**Description:** ${description}\n**Pris par:** ${pseudo}`, `#FF0000`, `https://cdn.discordapp.com/attachments/1083724872045297734/1124914370217005127/LSMS.png`, null, `Rendez-vous ${type}`, `https://cdn.discordapp.com/attachments/1083724872045297734/1124914370217005127/LSMS.png`, null, null, null, false);
    },
}
