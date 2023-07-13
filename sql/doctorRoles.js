//Récup du logger
const logger = require('./../modules/logger');
//Récup de la connection SQL
const mysql = require('./../modules/sql');

module.exports = {
    //Fonction qui ajoute une liste de rôles dans la DB
    addRoles: (discordUserId, rolesId) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query("INSERT INTO `doctorRoles`(`discordUserId`, `rolesId`) VALUES ('" + discordUserId + "', '" + rolesId + "')", (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    },
    //Fonction qui récupère une liste de rôles dans la DB
    getRoles: (discordUserId) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query("SELECT `rolesId` FROM `doctorRoles` WHERE `discordUserId`='" + discordUserId + "'", (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    },
    //Fonction qui supprime une liste de rôles dans la DB
    deleteRoles: (discordUserId) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query("DELETE FROM `doctorRoles` WHERE `discordUserId`='" + discordUserId + "'", (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    }
}