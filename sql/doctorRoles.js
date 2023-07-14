//Récup du logger
const logger = require('./../modules/logger');
//Récup de la connection SQL
const mysql = require('./../modules/sql');

module.exports = {
    //Fonction qui créé la base table
    createdoctorRolesTable: () => {
        return new Promise((resolve, reject) => {
            mysql.sql().query("CREATE TABLE IF NOT EXISTS `doctorRoles` (`discordUserId` varchar(255) NOT NULL,`rolesId` TEXT)")
            resolve();
        });
    },
    //Fonction qui ajoute une liste de rôles dans la DB
    addRoles: (discordUserId, rolesId) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                slq: "INSERT INTO `doctorRoles`(`discordUserId`, `rolesId`) VALUES (?, ?)",
                timeout: 40000,
                values: [discordUserId, rolesId]
            }, (reqErr, result, fields) => {
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
            mysql.sql().query({
                    sql: "SELECT `rolesId` FROM `doctorRoles` WHERE `discordUserId`=?",
                    timeout: 40000,
                    values: [discordUserId]
                }, (reqErr, result, fields) => {
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
            mysql.sql().query({
                    sql: "DELETE FROM `doctorRoles` WHERE `discordUserId`=?",
                    timeout: 40000,
                    values: [discordUserId]
                }, (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    }
}
