//Récupération des fonctions pour créer une commande et un modal
const { SlashCommandBuilder } = require('discord.js');
//Récup du logger
const logger = require('../../modules/logger');
//Récup du SQL pour les rôles
const doctorRoles = require('../../sql/doctorRoles');
//Récup du créateur d'embed
const emb = require('./../../modules/embeds');

module.exports = {
    //Création de la commande
    data: new SlashCommandBuilder()
        .setName('vacances')
        .setDescription('Mettre un docteur en vacances')
        .addUserOption(option => option.setName('docteur').setDescription('Mentionnez le docteur à mettre en vacances').setRequired(true)),
    async execute(interaction) {
        //Affichage du message "Iris réfléchis..."
        await interaction.deferReply({ ephemeral: true });
        //Récupération du docteur
        let docteur = interaction.options.getUser('docteur');
        docteur = interaction.guild.members.cache.get(docteur.id);
        //Récupération de l'ID du docteur
        const docteurId = docteur.id;
        //Récupération des rôles de la guild du docteur
        const roles = interaction.guild.roles.cache;
        //Ajout des rôles de docteur dans un tableau
        let docteurRolesArray = [];
        //Pour chaque rôle de la guild
        roles.forEach(async role => {
            //Ajout du rôle dans le tableau
            docteurRolesArray.push(role.id);
        });
        //Ajouter les rôles dans la DB
        doctorRoles.addRoles(docteurId, docteurRolesArray);
        //Retirer les rôles au docteur
        await docteur.roles.remove(docteur.roles.cache);
        //Ajouter le rôle de vacances : in env : IRIS_VACANCES_ROLE_ID=
        const vacancesRole = interaction.guild.roles.cache.get(process.env.IRIS_VACANCES_ROLE_ID);
        //Ajouter le rôle de vacances au docteur
        await docteur.roles.add(vacancesRole);
        interaction.followUp({ embeds: [emb.generate(`Gestion des vacanciers`, null, `<@${docteur.id}> à bien été mis(e) en vacances !`, `#0DE600`, null, null, null, null, null, interaction.client.user.username, interaction.client.user.avatarURL(), true)], ephemeral: true });
    }
}
