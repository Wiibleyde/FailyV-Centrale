//Récup du logger
const logger = require('./logger');
//Récup du SQL pour les rôles
const doctorRoles = require('../sql/doctorManagement/doctorRoles');
//Importation du module pour kick du service
const kickservice = require('./kickservice');

module.exports = {
    switchVacacionMode: (user, member, guild, interactionMember) => {
        return new Promise(async (resolve, reject) => {
            //Récupération des rôles de l'utilisateur
            let roles = member.roles.cache;

            //Check si le docteur est déjà en vacances
            if(member.roles.cache.has(process.env.IRIS_VACANCES_ROLE_ID)) {
                //Remove le rôle
                await member.roles.remove(process.env.IRIS_VACANCES_ROLE_ID);
                //Réassigne les rôles de l'utilisateur dans le DB
                try {
                    //Récupération des rôles de l'utilisateur
                    roles = await doctorRoles.getRoles(user.id);
                    roles.forEach(async role => {
                        //Parse les rôles
                        let rolesParsed = JSON.parse(role.rolesId)
                        rolesParsed.forEach(async roleParsed => {
                            //Récupère les rôles de la guild
                            let roleInSet = guild.roles.cache.get(roleParsed);
                            await member.roles.add(roleInSet);
                        })
                    })
                    //Supprime les rôles de la DB
                    await doctorRoles.deleteRoles(user.id);
                    resolve('returned');
                } catch (error) {
                    reject(error);
                }
            } else {
                if(member.roles.cache.has(process.env.IRIS_SERVICE_ROLE_ID)) {
                    //Kick le docteur du service
                    await kickservice.kickSomeone(member, guild, interactionMember, false);
                    //Refresh la liste des rôles
                    roles = member.roles.cache;
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
                await doctorRoles.addRoles(user.id, docteurRolesJSON);
                //Retirer les rôles valide au docteur 
                docteurRolesArray.forEach(async role => {
                    //Récupère le rôle
                    await member.roles.remove(role);
                });
                //Ajouter le rôle de vacances : in env : IRIS_VACANCES_ROLE_ID=
                let vacancesRole
                await guild.roles.fetch().then((r) => { r.map(roleData => { if(roleData.id == process.env.IRIS_VACANCES_ROLE_ID) { vacancesRole = roleData.id; } }); });
                //Ajouter le rôle de vacances au docteur
                await member.roles.add(vacancesRole);
                resolve('gone');
            }
        });
    }
}