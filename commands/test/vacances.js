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
        //Si roles contient role.id == process.env.IRIS_VACANCES_ROLE_ID
        if (roles.has(process.env.IRIS_VACANCES_ROLE_ID)) {
            //Remove le rôle
            await docteur.roles.remove(process.env.IRIS_VACANCES_ROLE_ID)
            //Réassigne les rôles de l'utilisateur dans le DB
            try {
                let roles = doctorRoles.getRoles(docteurId)
                roles.forEach(async role => {
                    await docteur.roles.add(role.roleId);
                })
                interaction.followUp({ embeds: [emb.generate(`Gestion des vacanciers`, null, `<@${docteur.id}> à bien été retiré(e) des vacances !`, `#0DE600`, null, null, null, null, null, interaction.client.user.username, interaction.client.user.avatarURL(), true)], ephemeral: true });
                return;
            } catch (error) {
                logger.error(error);
            }
        }
        // Ajout des rôles de docteur dans un tableau
        let docteurRolesArray = [];
        // Pour chaque rôle de la guild
        roles.forEach(async role => {
            // Ajout du rôle dans le tableau
            docteurRolesArray.push(role.id);
        });
        // Convertir le tableau en liste JSON
        let docteurRolesJSON = JSON.stringify(docteurRolesArray);
        //Ajouter les rôles dans la DB
        doctorRoles.addRoles(docteurId, docteurRolesJSON);
        //Retirer les rôles au docteur
        await docteur.roles.remove(docteur.roles.cache);
        //Ajouter le rôle de vacances : in env : IRIS_VACANCES_ROLE_ID=
        const vacancesRole = interaction.guild.roles.cache.get(process.env.IRIS_VACANCES_ROLE_ID);
        //Ajouter le rôle de vacances au docteur
        await docteur.roles.add(vacancesRole);
        interaction.followUp({ embeds: [emb.generate(`Gestion des vacanciers`, null, `<@${docteur.id}> à bien été mis(e) en vacances !`, `#0DE600`, null, null, null, null, null, interaction.client.user.username, interaction.client.user.avatarURL(), true)], ephemeral: true });
    }
}
