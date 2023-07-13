//Récupération des fonctions pour créer une commande et un modal
const { SlashCommandBuilder } = require('discord.js');
//Récup du logger
const logger = require('../../modules/logger');
//Récup du SQL pour les rôles
const doctorRoles = require('../../sql/doctorRoles');

module.exports = {
    //Création de la commande
    data: new SlashCommandBuilder()
        .setName('vacances')
        .setDescription('Mettre un docteur en vacances')
        .addMentionableOption(option => option.setName('docteur').setDescription('Mentionnez le docteur à mettre en vacances').setRequired(true)),
    async execute(interaction) {
        //Affichage du message "Iris réfléchis..."
        await interaction.deferReply({ ephemeral: true });
        //Récupération du docteur
        const docteur = interaction.options.getMentionable('docteur');
        //Récupération de l'ID du docteur
        const docteurId = docteur.id;
        //Récupération des rôles de la guild du docteur
        const roles = interaction.guild.roles.cache;
        //Ajout des rôles de docteur dans un tableau
        const docteurRolesArray = [];
        //Pour chaque rôle de la guild
        roles.forEach(role => {
            //Si le rôle est un rôle de docteur
            if (doctorRoles.includes(role.id)) {
                //Ajout du rôle dans le tableau
                docteurRolesArray.push(role);
            }
        }
        );
        //Ajouter les rôles dans la DB
        doctorRoles.addRoles(docteurId, docteurRolesArray);
        //Ajouter le rôle de vacances : in env : IRIS_VACANCES_ROLE_ID=
        const vacancesRole = interaction.guild.roles.cache.get(process.env.IRIS_VACANCES_ROLE_ID);
        //Ajouter le rôle de vacances au docteur
        docteur.roles.add(vacancesRole);
    }
}
