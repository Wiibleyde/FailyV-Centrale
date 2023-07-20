//Récup du logger
const logger = require('../../modules/logger');
//Récup de la connection SQL
const mysql = require('../../modules/sql');

module.exports = {
    //Fonction de récupération d'une radio en DB
    registerRDV: (user, phoneNumber, type, desc) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "INSERT INTO `rdv` (`user`, `phone`, `type`, `desc`) VALUES (?, ?, ?, ?)",
                    timeout: 40000,
                    values: [user, phoneNumber, type, desc]
                }, (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    },
    //Fonction de récupération d'une radio en DB
    getRDVbyID: (id) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query({
                    sql: "SELECT * FROM `rdv` WHERE `id` = ?",
                    timeout: 40000,
                    values: [id]
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
