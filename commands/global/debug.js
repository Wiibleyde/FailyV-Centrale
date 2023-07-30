//Récupération des fonctions pour créer une commande et un modal
const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    //Création de la commande
    data: new SlashCommandBuilder()
        .setName(`debug`)
        .setDescription(`Faire un bug report.`)
        .addAttachmentOption(option =>
            option.setName(`screenshot`)
            .setDescription(`Ajouter un screen à votre bug report`)
            .setRequired(false)
        ),
    async execute(interaction) {
    //Action lors de l'execution de la commande
        let screenURL = '';
        if(interaction.options.getAttachment('screenshot') != null) {
            screenURL = interaction.options.getAttachment('screenshot').attachment;
        }
        //Création d'un modal avec chaques encadrés détaillés
        const debugModal = new ModalBuilder().setCustomId(`debugModal`).setTitle(`Demande de debug`);
        const commandToDebug = new TextInputBuilder().setCustomId(`commandToDebug`).setLabel(`Nom de la commande/action buggé(e)`).setStyle(TextInputStyle.Short).setPlaceholder(`Ex: /lit`).setRequired(true);
        const problem = new TextInputBuilder().setCustomId(`problem`).setLabel(`Que fait-il et comment cela se produit-il ?`).setStyle(TextInputStyle.Paragraph).setPlaceholder(`Ex: Quand je l'execute tout les boutons ne se génèrent pas`).setRequired(true);
        const everyTime = new TextInputBuilder().setCustomId(`everyTime`).setLabel(`Le fait-il à chaques fois ?`).setStyle(TextInputStyle.Short).setPlaceholder(`Oui / Non / Ne sais pas`).setRequired(true);
        const screenshot = new TextInputBuilder().setCustomId(`screenshot`).setLabel(`URL d'un screen du bug`).setValue(screenURL).setStyle(TextInputStyle.Short).setRequired(false);
        //Passage des encadrés en ActionRow
        const commandToDebugActionRow = new ActionRowBuilder().addComponents(commandToDebug);
        const problemActionRow = new ActionRowBuilder().addComponents(problem);
        const everyTimeActionRow = new ActionRowBuilder().addComponents(everyTime);
        const screenshotActionRow = new ActionRowBuilder().addComponents(screenshot);
        //Envois du modal
        debugModal.addComponents(commandToDebugActionRow, problemActionRow, everyTimeActionRow, screenshotActionRow);
        await interaction.showModal(debugModal);
    },
};