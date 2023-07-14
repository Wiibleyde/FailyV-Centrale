//Récupération des fonctions pour créer une commande et un modal
const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
//Récup du logger
const logger = require('../../modules/logger');
//Récup du créateur d'embed
const emb = require('../../modules/embeds');

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

//Création de constantes pour le choix de rendez-vous
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
                .addChoices(rdvChir, rdvPsy)
        ),
    async execute(interaction) {
        const rendezVousModal = new ModalBuilder().setCustomId('rendezVousModal').setTitle('Ajout d\'un rendez-vous');
        const nomPrenom = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('nomPrenom').setLabel('Nom et prénom de la personne concernée').setStyle(TextInputStyle.Short).setPlaceholder('Ex: Nathan Prale').setRequired(true));
        const numero = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('numero').setLabel('Numéro de téléphone de la personne concernée').setStyle(TextInputStyle.Short).setPlaceholder('Ex: 555-XXXX').setRequired(true));
        const description = new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('description').setLabel('Description du rendez-vous').setStyle(TextInputStyle.Paragraph).setPlaceholder("Ex: Nathan Prale a besoin d\'une consultation pour parler à la suite de prises d'otage").setRequired(true));
        rendezVousModal.addComponents(nomPrenom, numero, description);
        await interaction.showModal(rendezVousModal);
    },
    async handle(interaction) {
        //Get user guild pseudo
        const pseudo = interaction.member.displayName;
        //Create embed
        const rendezVousEmb = emb.generate(null, null, `**Nom et prénom:** ${nomPrenom}\n**Numéro de téléphone:** ${numero}\n**Description:** ${description}\n**Contacté:** 0 fois\n**Pris par:** ${pseudo}`, `#FF0000`, `https://cdn.discordapp.com/attachments/1083724872045297734/1124914370217005127/LSMS.png`, null, `Rendez-vous ${type}`, `https://cdn.discordapp.com/attachments/1083724872045297734/1124914370217005127/LSMS.png`, null, null, null, false);
        //Get rendez-vous channel
        const rendezVousChannel = rendezVousChannelsChoices.find(channel => channel.name === type);
        //Send confirmation message
        await interaction.reply({ content: `Le rendez-vous a bien été ajouté à l'agenda.`, ephemeral: true });

        //Ajout des boutons sous l'embed pour : Dire que le rendez vous est fini, que la personne a été contactée, que le rendez-vous a été pris/que la date a été fixée, que le rendez-vous a été annulé
        const rendezVousActionRow = new ActionRowBuilder().addComponents(
            {
                type: 'BUTTON',
                customId: 'rendezVousFini',
                label: 'Rendez-vous fini',
                style: 'PRIMARY',
            },
            {
                type: 'BUTTON',
                customId: 'rendezVousContacte',
                label: 'Personne contactée',
                style: 'PRIMARY',
            },
            {
                type: 'BUTTON',
                customId: 'rendezVousPris',
                label: 'Rendez-vous pris',
                style: 'PRIMARY',
            },
            {
                type: 'BUTTON',
                customId: 'rendezVousAnnule',
                label: 'Rendez-vous annulé',
                style: 'PRIMARY',
            },
        );
        //Send embed with buttons
        interaction.client.channels.cache.get(rendezVousChannel.value).send({ embeds: [rendezVousEmb], components: [rendezVousActionRow] });
    },
}
