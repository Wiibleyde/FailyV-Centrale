//Récupération des fonctions pour créer une commande et un modal
const { SlashCommandBuilder } = require('discord.js');
//Récup du logger
const logger = require('../../modules/logger');
//Récup du SQL pour les rôles
const doctorRoles = require('../../sql/doctorRoles');
//Récup du créateur d'embed
const emb = require('../../modules/embeds');

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
        // Ajout des rôles de docteur dans un tableau
        let docteurRolesArray = [];
        //Check si le docteur est déjà en vacances
        const hasVacance = await userRolesContainsRoleId(docteurRolesArray, process.env.IRIS_VACANCES_ROLE_ID)
        if (hasVacance) {
            //Remove le rôle
            await docteur.roles.remove(process.env.IRIS_VACANCES_ROLE_ID)
            //Réassigne les rôles de l'utilisateur dans le DB
            try {
                let roles = doctorRoles.getRoles(docteurId)
                roles = JSON.parse(roles);
                roles.forEach(async role => {
                    let roleInSet = interaction.guild.roles.cache.get(role.roleId);
                    await docteur.roles.add(roleInSet);
                })
                interaction.followUp({ embeds: [emb.generate(`Gestion des vacanciers`, null, `<@${docteur.id}> à bien été retiré(e) des vacances !`, `#0DE600`, null, null, null, null, null, interaction.client.user.username, interaction.client.user.avatarURL(), true)], ephemeral: true });
                return;
            } catch (error) {
                logger.error(error);
            }
        }
        // Pour chaque rôle de la guild
        roles.forEach(async role => {
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
        interaction.followUp({ embeds: [emb.generate(`Gestion des vacanciers`, null, `<@${docteur.id}> à bien été mis(e) en vacances !`, `#0DE600`, process.env.LSMS_LOGO_V2, null, null, null, null, interaction.client.user.username, interaction.client.user.avatarURL(), true)], ephemeral: true });
    }
}

function userRolesContainsRoleId(rolesArray, idToCheck) {
    return new Promise((resolve, reject) => {
        rolesArray.forEach(role => {
            logger.debug(role.id + " " + idToCheck)
            if (role.id == idToCheck) {
                resolve(true);
            }
        })
        resolve(false);
    })
}
