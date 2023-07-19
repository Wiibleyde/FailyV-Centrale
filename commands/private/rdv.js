//Récupération des fonctions pour créer une commande et un modal
const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
//Récup du logger
const logger = require('../../modules/logger');

//Création de constantes pour le choix de rendez-vous
const rdvGen = {
    name: 'Général',
    value: 'general',
}
const rdvChir = {
    name: 'Chirurgie',
    value: 'chirurgie',
};
const rdvPsy = {
    name: 'Psychologie',
    value: 'psychologie',
};

module.exports = {
    //Création de la commande
    data: new SlashCommandBuilder()
        .setName('rdv')
        .setDescription('Ajouter un rendez-vous à l\'agenda.')
        //Ajout des choix pour le type de rendez-vous
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Type de rendez-vous')
                .setRequired(true)
                .addChoices(rdvGen, rdvChir, rdvPsy)
        ),
    async execute(interaction) {
        //Si le type est psy
        if (interaction.options.getString('type') === 'psychologie') {
            const rendezVousPsyModal = new ModalBuilder().setCustomId('rendezVousPsyModal').setTitle('Ajout d\'un rendez-vous');
            const nomPrenom = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('nomPrenom').setLabel('Nom et prénom de la personne concernée').setStyle(TextInputStyle.Short).setPlaceholder('Ex: Nathan Prale').setRequired(true));
            const numero = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('numero').setLabel('Numéro de téléphone de la personne concernée').setStyle(TextInputStyle.Short).setPlaceholder('Ex: 555-XXXX').setRequired(true));
            const description = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('description').setLabel('Description du rendez-vous').setStyle(TextInputStyle.Paragraph).setPlaceholder("Ex: Nathan Prale a besoin d\'une consultation pour parler à la suite de prises d'otage").setRequired(true));
            rendezVousPsyModal.addComponents(nomPrenom, numero, description);
            await interaction.showModal(rendezVousPsyModal);
        } else if(interaction.options.getString('type') === 'chirurgie') {
            const rendezVousChirModal = new ModalBuilder().setCustomId('rendezVousChirModal').setTitle('Ajout d\'un rendez-vous');
            const nomPrenom = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('nomPrenom').setLabel('Nom et prénom de la personne concernée').setStyle(TextInputStyle.Short).setPlaceholder('Ex: Nathan Prale').setRequired(true));
            const numero = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('numero').setLabel('Numéro de téléphone de la personne concernée').setStyle(TextInputStyle.Short).setPlaceholder('Ex: 555-XXXX').setRequired(true));
            const description = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('description').setLabel('Description du rendez-vous').setStyle(TextInputStyle.Paragraph).setPlaceholder("Ex: Nathan Prale a besoin d\'une consultation pour parler à la suite de prises d'otage").setRequired(true));
            rendezVousChirModal.addComponents(nomPrenom, numero, description);
            await interaction.showModal(rendezVousChirModal);
        } else if(interaction.options.getString('type') === 'general') {
            const rendezVousGenModal = new ModalBuilder().setCustomId('rendezVousGenModal').setTitle('Ajout d\'un rendez-vous');
            const nomPrenom = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('nomPrenom').setLabel('Nom et prénom de la personne concernée').setStyle(TextInputStyle.Short).setPlaceholder('Ex: Nathan Prale').setRequired(true));
            const numero = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('numero').setLabel('Numéro de téléphone de la personne concernée').setStyle(TextInputStyle.Short).setPlaceholder('Ex: 555-XXXX').setRequired(true));
            const description = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('description').setLabel('Description du rendez-vous').setStyle(TextInputStyle.Paragraph).setPlaceholder("Ex: Nathan Prale a besoin d\'une consultation pour parler à la suite de prises d'otage").setRequired(true));
            rendezVousGenModal.addComponents(nomPrenom, numero, description);
            await interaction.showModal(rendezVousGenModal);
        }
    },
}
