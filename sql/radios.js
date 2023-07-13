//Récup du logger
const logger = require('./../modules/logger');
//Récup de la connection SQL
const mysql = require('./../modules/sql');

module.exports = {
    //Fonction de récupération d'une radio en DB
    getRadio: (radToGet) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query("SELECT `" + radToGet + "` FROM `radios`", (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    },
    //Fonction d'update d'une radio en DB
    setRadio: (radToSet, radio) => {
        return new Promise((resolve, reject) => {
            mysql.sql().query("UPDATE `radios` SET `" + radToSet + "`='" + radio + "' WHERE 1", (reqErr, result, fields) => {
                if(reqErr) {
                    logger.error(reqErr);
                    reject(reqErr);
                }
                resolve(result);
            });
        });
    }
}