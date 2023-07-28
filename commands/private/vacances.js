//Récupération des fonctions pour créer une commande
const { SlashCommandBuilder } = require('discord.js');
//Récup du logger
const logger = require('../../modules/logger');
//Récup du SQL pour les rôles
const doctorRoles = require('../../sql/doctorManagement/doctorRoles');
//Récup du créateur d'embed
const emb = require('../../modules/embeds');
//Importation du module pour kick du service
const kickservice = require('../../modules/kickservice');
//Importantion du module pour attendre
const wait = require('node:timers/promises').setTimeout;
//Récup du gestionnaire d'autoriasation
const { Rank, hasAuthorization } = require('../../modules/rankAuthorization');

module.exports = {
    //Création de la commande
    data: new SlashCommandBuilder()
        .setName('vacances')
        .setDescription('Mettre un docteur en vacances ou retirer les accès')
        .addUserOption(option => option.setName('docteur').setDescription('Mentionnez le docteur à mettre en vacances').setRequired(true)),
    async execute(interaction) {
        if (!hasAuthorization(Rank.Rank.DepartementManager, interaction.member.roles.cache)) {
            const embed = emb.generate("Désolé :(", null, `Vous n'avez pas les permissions suffisantes pour utiliser cette commande. Il faut être <@&${process.env.IRIS_DEPARTEMENT_MANAGER_ROLE}> ou plus pour pouvoir vous en servir !`, "#FF0000", process.env.LSMS_LOGO_V2, null, `Gestion des employés`, `https://cdn.discordapp.com/icons/${process.env.IRIS_PRIVATE_GUILD_ID}/${interaction.guild.icon}.webp`, null, null, null, false);
            await interaction.editReply({ embeds: [embed], ephemeral: true });
            await wait(5000);
            await interaction.deleteReply();
            return;
        }
        //Affichage du message "Iris réfléchis..."
        await interaction.deferReply({ ephemeral: true });
        //Récupération du docteur
        let docteur = interaction.options.getUser('docteur');
        docteur = interaction.guild.members.cache.get(docteur.id);
        //Si l'utilisateur est le bot ne pas continuer
        if (docteur.id == process.env.IRIS_DISCORD_ID) {
            interaction.followUp({ embeds: [emb.generate(`Gestion des vacanciers`, null, `Vous ne pouvez pas mettre en vacances le bot`, `#FF0000`, process.env.LSMS_LOGO_V2, null, null, null, null, interaction.client.user.username, interaction.client.user.avatarURL(), true)], ephemeral: true });
            return;
        }
        //Récupération de l'ID du docteur
        const docteurId = docteur.id;
        //Récupération des rôles de l'utilisateur
        let roles = docteur.roles.cache;            
        //Check si le docteur est déjà en vacances
        if (docteur.roles.cache.has(process.env.IRIS_VACANCES_ROLE_ID)) {
            //Remove le rôle
            await docteur.roles.remove(process.env.IRIS_VACANCES_ROLE_ID)
            //Réassigne les rôles de l'utilisateur dans le DB
            try {
                //Récupération des rôles de l'utilisateur
                let roles = await doctorRoles.getRoles(docteurId)
                roles.forEach(async role => {
                    //Parse les rôles
                    let rolesParsed = JSON.parse(role.rolesId)
                    rolesParsed.forEach(async roleParsed => {
                        //Récupère les rôles de la guild
                        let roleInSet = interaction.guild.roles.cache.get(roleParsed);
                        await docteur.roles.add(roleInSet);
                    })
                })
                //Supprime les rôles de la DB
                doctorRoles.deleteRoles(docteurId);
                //Envoi d'un embed de confirmation
                interaction.followUp({ embeds: [emb.generate(`Gestion des vacanciers`, null, `Les accès de <@${docteur.id}> ont bien été restitué`, `#0DE600`, process.env.LSMS_LOGO_V2, null, null, null, null, interaction.client.user.username, interaction.client.user.avatarURL(), true)], ephemeral: true });
                return;
            } catch (error) {
                logger.error(error);
            }
        } else {
            if(docteur.roles.cache.has(process.env.IRIS_SERVICE_ROLE_ID)) {
                //Kick le docteur du service
                await kickservice.kickSomeone(docteur, interaction.guild, interaction.member, false);
                //Refresh la liste des rôles
                roles = docteur.roles.cache;
            }
            //Ajout des rôles de docteur dans un tableau
            let docteurRolesArray = [];
            //Parse json to array process.env.IRIS_VACANCES_EXCLUDE_ROLES_ID
            let excludeRoles = process.env.IRIS_VACANCES_EXCLUDE_ROLES_ID.split(',');
            //Pour chaque rôle de la guild
            roles.forEach(async role => {
                //Si le role.id == guild id 
                if (role.id != process.env.IRIS_PRIVATE_GUILD_ID) {
                    //Si le role.id est dans excludeRoles (rôles à exclure) ne pas l'ajouter au tableau
                    if (!excludeRoles.includes(role.id)) {
                        //Ajouter le rôle au tableau
                        docteurRolesArray.push(role.id);
                    }
                }
            });
            //Convertir le tableau en liste JSON
            let docteurRolesJSON = JSON.stringify(docteurRolesArray);
            //Ajouter les rôles dans la DB
            doctorRoles.addRoles(docteurId, docteurRolesJSON);
            //Retirer les rôles valide au docteur 
            docteurRolesArray.forEach(async role => {
                //Récupère le rôle
                await docteur.roles.remove(role);
            });
            //Ajouter le rôle de vacances : in env : IRIS_VACANCES_ROLE_ID=
            const vacancesRole = interaction.guild.roles.cache.get(process.env.IRIS_VACANCES_ROLE_ID);
            //Ajouter le rôle de vacances au docteur
            await docteur.roles.add(vacancesRole);
            //Envoi d'un embed de confirmation
            interaction.followUp({ embeds: [emb.generate(`Gestion des vacanciers`, null, `Les accès de <@${docteur.id}> ont bien été retiré`, `#0DE600`, process.env.LSMS_LOGO_V2, null, null, null, null, interaction.client.user.username, interaction.client.user.avatarURL(), true)], ephemeral: true });
        }
    }
}
